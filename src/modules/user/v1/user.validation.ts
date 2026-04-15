import Joi from 'joi';

export const createUserSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    fullName: Joi.string().min(2).max(100).required(),
    password: Joi.string().min(8).required(),
  }),
});

export const getUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});
