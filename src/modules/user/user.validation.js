import Joi from 'joi';

export const signUpSchema = { body: Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
}) };

export const loginSchema = { body: Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
}) };

export const verifyEmailSchema = { body: Joi.object({
  email: Joi.string().email().required(),
  otpCode: Joi.string().required()
}) };

export const requestCodeSchema = { body: Joi.object({
  email: Joi.string().email().required()
}) };

export const forgotPasswordSchema = { body: Joi.object({
  email: Joi.string().email().required()
}) };

export const resetPasswordSchema = { body: Joi.object({
  email: Joi.string().email().required(),
  forgetCode: Joi.string().required(),
  password: Joi.string().min(6).required()
}) };

export const refreshTokenSchema = { query: Joi.object({
  token: Joi.string().required()
}) };
