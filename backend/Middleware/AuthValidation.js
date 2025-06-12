import Joi from "joi";

const signupValidation = (req, res, next) => {
    const schema = Joi.object({
        name : Joi.string().min(3).max(50).required(),
        email : Joi.string().min(6).max(100).required().email(),
        password : Joi.string().min(8).max(20).required()
    });
    const {error} = schema.validate(req.body);
    if(error) {
        return res.status(400).json({message: "Bad Request", error})
    }
    next();
}

const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email : Joi.string().min(6).max(100).required().email(),
        password : Joi.string().min(8).max(20).required()
    });
    const {error} = schema.validate(req.body);
    if(error) {
        return res.status(400).json({message: "Bad Request", error})
    }
    next();
}


export {
  signupValidation,
  loginValidation
}