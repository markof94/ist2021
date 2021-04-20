const fs = require('fs');
const path = require('path');
const uuid = require('uuid').v4;

const PATH = "products.json";

const baseProduct = {
  id: "",
  category: "",
  price: 1,
  currency: "RSD",
  text: "",
  tags: "",
  discounts: [],
};

const readProducts = () => {
  const products = fs.readFileSync(path.join(__dirname, PATH), (err, data) => {
    if (err) throw err;

    return data;
  });

  return JSON.parse(products);
}

const saveProducts = (data) => {
  if (!data) return;
  fs.writeFileSync(path.join(__dirname, PATH), JSON.stringify(data));
};

exports.getProducts = () => readProducts();

exports.getProductById = (id) => {
  const products = readProducts();
  return products.find((product) => product.id === id);
};

exports.getProductsByCategory = (category) => {
  const products = readProducts();
  return products.filter((product) => product.category === category);
};

exports.addProduct = (product) => {
  const products = readProducts();
  const newProduct = { ...baseProduct, ...product, id: uuid() };
  products.push(newProduct);
  saveProducts(products);
};

exports.deleteProduct = (id) => {
  const products = readProducts().filter((product) => product.id !== id);
  saveProducts(products);
};

exports.updateProduct = (id, newAttributes) => {
  const products = readProducts().map((product) => {
    if (id === product.id) {
      return { ...product, ...newAttributes };
    } else {
      return product;
    }
  });

  console.log(id, newAttributes)

  saveProducts(products);
};
