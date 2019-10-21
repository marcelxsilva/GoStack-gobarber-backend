import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }
  async handle({ data }) {
    const { appointment } = data;
    await mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento Cancelado',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(parseISO(appointment.date),
          "'Dia' dd 'de' MMMM 'ás', H:mm'h' ",
          { locale: pt }
        )
      }
    });
  }
}
export default new CancellationMail();
