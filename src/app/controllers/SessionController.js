import jwt from 'jsonwebtoken';
import User from '../models/User';
import File from '../models/File';
import authConfig from '../../config/auth';
import * as yup from 'yup';

class SessionController {

  async store(req, res) {
    const schema = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' })
    }


    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['path', 'url', 'id']
        }
      ]

    });

    if (!user) { res.status(401).json({ error: 'user not found' }) }

    if (!await user.checkPassword(password)) {
      return res.status(401).json({ error: 'password does not match' });
    }
    const { id, name, avatar } = user;
    return res.json({
      user: {
        id,
        name,
        email,
        avatar
      },
      token: jwt.sign({ id }, authConfig.secret, { expiresIn: authConfig.expiresIn })
    })
  }
}

export default new SessionController();
