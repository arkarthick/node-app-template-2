import Joi from 'joi';

export const createTesteSchema = Joi.object({
  name: Joi.string().required(),
});

export const getTesteSchema = Joi.object({
  id: Joi.string().required(),
});
