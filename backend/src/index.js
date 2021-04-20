const express = require('express');
const productService = require('./service');

const PORT = 3000;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/getProducts', (req, res) => {
  res.send(productService.getProducts());
});

app.get('/products/:id', (req, res) => {
  res.send(productService.getProductById(req.params['id']));
});

app.post('/addProduct', (req, res) => {
  const { product } = req.body;
  productService.addProduct(product);
  res.end('OK');
});

app.post('/updateProduct', (req, res) => {
  const { id, newAttributes } = req.body;
  productService.updateProduct(id, newAttributes);
  res.end('OK');
});

app.get('/getProducts/:category', (req, res) => {
  res.send(productService.getProductsByCategory(req.params['category']));
});

app.delete('/deleteProduct/:id', (req, res) => {
  const id = req.params['id'];
  productService.deleteProduct(id);
  res.end('OK');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});