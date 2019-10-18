import Appointments from '../models/Appointments';
import User from '../models/User';
import { startOfHour, parseISO, isBefore, } from 'date-fns'
import * as yup from 'yup';

class AppointmentController {
  async store(req, res) {
    const schema = yup.object().shape({
      provider_id: yup.number().required(),
      date: yup.date().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validate fails' })
    }
    const { provider_id, date } = req.body;

    // check if provider is a provider
    const isProvider = await User.findOne({ where: { id: provider_id, provider: true } });
    if (!isProvider) { return res.status(400).json({ error: 'you can only create appointments with providers' }) }

    const hourStart = startOfHour(parseISO(date));

    // verificando se a data inserida ja pasou / se é valida
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'past dates are not permited' })
    }

    // verificando se ja existe um agendamento no horario
    const checkAvailability = await Appointments.findOne({
      where: { provider_id, canceled_at: null, date: hourStart }
    })
    if (checkAvailability) {
      return res.status(400).json({ error: 'appointment date is no available' })
    }

    const appointment = await Appointments.create({
      user_id: req.userId,
      provider_id,
      date: hourStart
    })
    res.json(appointment)
  }
}
export default new AppointmentController();
