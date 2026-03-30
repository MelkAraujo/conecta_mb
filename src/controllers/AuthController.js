const AuthService = require('../services/AuthService');

class AuthController {
    async login(req, res) {
        try {
            const { email, senha } = req.body;
            const result = await AuthService.login(email, senha);
            return res.json(result);
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    }
}

module.exports = new AuthController();