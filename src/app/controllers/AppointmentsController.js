import Appointments from '../models/Appointments';
import User from '../models/User';
import File from '../models/File';
import NotificationSchema from '../schemas/Notification';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns'
import pt from 'date-fns/locale/pt';
import * as yup from 'yup';
import Queue from '../../lib/Queue';
import CancellationMail from '../../app/jobs/CancellationMail';

class AppointmentController {

  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointments.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      offset: (page - 1) * 20,
      limit: 20,
      attributes: ['id', 'date', 'past', 'cancelable'],
      include: [{
        model: User,
        as: 'provider',
        attributes: ['id', 'name'],
        include: [{
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }]
      }]
    });
    return res.status(200).json(appointments);
  }

  async store(req, res) {
    const schema = yup.object().shape({
      provider_id: yup.number().required(),
      date: yup.date().required(),
    });
    // verificando se o dados recebidos s]ao validos
    if (!(await schema.isValid(req.body))) { return res.status(400).json({ error: 'validate fails' }) }
    const { provider_id, date } = req.body;
    const hourStart = startOfHour(parseISO(date));

    // check if provider is a provider
    const isProvider = await User.findOne({ where: { id: provider_id, provider: true } });
    if (!isProvider) { return res.status(400).json({ error: 'you can only create appointments with providers' }) }

    // verificando se a data inserida ja pasou / se é valida
    if (isBefore(hourStart, new Date())) { return res.status(400).json({ error: 'past dates are not permited' }) }

    // verificando se ja existe um agendamento no horario
    const checkAvailability = await Appointments.findOne({
      where: { provider_id, canceled_at: null, date: hourStart }
    })
    if (checkAvailability) { return res.status(400).json({ error: 'appointment date is no available' }) }
    if (req.userId === isProvider.id) { return res.status(400).json({ error: 'only provider' }) }
    const appointment = await Appointments.create({
      user_id: req.userId,
      provider_id,
      date: hourStart
    });

    // NOTIFY APPOINTMENT PROVIDER

    // buscando usuario que realizou agendamento
    const user = await User.findByPk(req.userId);
    const formatedDate = format(hourStart,
      "'Dia' dd 'de' MMMM 'ás', H:mm'h' ",
      {
        locale: pt
      }
    );
    await NotificationSchema.create({
      content: `Novo Agendamento de ${user.name}  em ${formatedDate}`,
      user: provider_id,
    });
    res.json(appointment)
  }

  async delete(req, res) {
    const appointment = await Appointments.findOne({
      where: { id: req.params.id, canceled_at: null },
      include: [{
        model: User,
        as: 'provider',
        attributes: ['name', 'email']
      },
      {
        model: User,
        as: 'user',
        attributes: ['name']
      }]
    })
    if (appointment.user_id !== req.userId) { return res.status(401).json({ error: "your don't have permission to cancel this appointment " }) }

    // verificando se a hora do cancelamento e menor que duas horas atras
    const dateWithSub = subHours(appointment.date, 2);
    if (isBefore(dateWithSub, new Date())) { return res.status(401).json({ error: 'you can only cancel appointment 2 hours in advance' }); }

    appointment.canceled_at = new Date();
    await appointment.save();

    // envio de email
    await Queue.add(CancellationMail.key, { appointment })

    return res.json(appointment)
  }
}
export default new AppointmentController();
