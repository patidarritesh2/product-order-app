const mongoose = require('mongoose');
const Product = require('../models/product.model');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

const checkId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid product id');
};

exports.list = asyncHandler(async (_req, res) => {
  res.json(await Product.find().sort({ createdAt: -1 }));
});

exports.get = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(product);
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json(await Product.create(req.body));
});

exports.update = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(product);
});

exports.remove = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.status(204).end();
});
