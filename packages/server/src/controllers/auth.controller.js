import bcrypt from 'bcrypt';

import { User as Model } from '../models';

export const login = async (req, res) => {
    const { error } = Model.validateAuth(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const User = await Model.findOne({
        where: { email: req.body.email }
    });
    if (!User) {
        return res.status(400).send('Invalid email or password');
    }

    const validSecret = await bcrypt.compare(req.body.secret, User.secret);
    if (!validSecret) {
        return res.status(400).send('Invalid email or password');
    }
    
    res.header('X-auth-token', User.generateJsonWebToken()).send(true);
};
