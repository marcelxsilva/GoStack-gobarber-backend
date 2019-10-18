import Appointments from '../models/Appointments';
import User from '../models/User';
import File from '../models/File';
import { startOfHour, parseISO, isBefore, } from 'date-fns'
import * as yup from 'yup';

class AppointmentController {

  async index(req, res) {
    const appointments = await Appointments.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
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

    const appointment = await Appointments.create({
      user_id: req.userId,
      provider_id,
      date: hourStart
    })
    res.json(appointment)
  }

}
export default new AppointmentController();
