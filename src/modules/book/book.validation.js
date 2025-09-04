import Joi from 'joi';

export const borrowBookSchema = {
  params: Joi.object({
    id: Joi.number().integer().required()
  })
};

export const returnBookSchema = {
  params: Joi.object({
    id: Joi.number().integer().required()
  })
};

export const getBookByFieldSchema = {
  headers: Joi.object({
    field: Joi.string().required(),
    value: Joi.string().required()
  }).unknown(true)
};

export const deleteBookSchema = {
  params: Joi.object({
    id: Joi.number().integer().required()
  })
};

export const addBookSchema = { body: Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  ISBN: Joi.string().required(),
  availabilityQuantity: Joi.number().integer().min(0).required(),
  shelfLocation: Joi.string().required(),
  publishedDate: Joi.date().required()
}) };

export const updateBookSchema = { body: Joi.object({
  title: Joi.string().optional(),
  author: Joi.string().optional(),
  ISBN: Joi.string().optional(),
  availabilityQuantity: Joi.number().integer().min(0).optional(),
  shelfLocation: Joi.string().optional(),
  publishedDate: Joi.date().optional()
}) };
