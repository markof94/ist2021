const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PORT = 5000;
const backendPath = 'http://localhost:3000';
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

const readViewByName = (name) => {
  return fs.readFileSync(path.join(__dirname + '/public/' + name + '.html'), 'utf-8')
};

app.get('/', (req, res) => {
  res.send(readViewByName('index'));
});

app.get('/products', (req, res) => {
  loadProducts(res, 'getProducts');
});

app.get('/products/category/:category', (req, res) => {
  const category = req.params['category'];
  loadProducts(res, `getProducts/${category}`);
});

app.get('/products/:id', (req, res) => {
  axios.get(`${backendPath}/products/${req.params['id']}`)
    .then(response => {
      if (response.data) {
        const title = response.data.text;
        const view = constructProduct(response.data, { includeCategory: true });

        res.send(readViewByName('product')
          .replace('#{title}', title)
          .replace('#{proizvod}', view));
      } else {
        res.send(readViewByName('index'));
      }
    })
    .catch(error => {
      console.log(error);
    });
});

app.get('/newProduct', (req, res) => {
  res.send(readViewByName('newProduct'));
});

app.get('/updateProduct/:id', (req, res) => {
  const id = req.params['id'];
  axios.get(`${backendPath}/products/${id}`)
    .then(response => {
      if (response.data) {
        const title = response.data.text;
        const view = constructProduct(response.data, {
          ignoreUpdate: true,
          includeCategory: true
        });

        res.send(readViewByName('updateProduct')
          .replace('#{title}', title)
          .replace('#{proizvod}', view)
          .replace('#{id}', id));
      } else {
        res.send(readViewByName('index'));
      }
    })
    .catch(error => {
      console.log(error);
      res.redirect('/products');
    });
});

app.post('/addProduct', (req, res) => {
  const { text, price, category, tags } = req.body;

  if (isValidInput(text, price)) {
    axios.post(`${backendPath}/addProduct`, {
      product: { text, price, category, tags },
    })
      .then(response => {
        res.redirect('/products');
      })
      .catch(error => {
        console.log(error);
        res.redirect('/products');
      });
  } else {
    res.redirect('/newProduct');
  }
});

app.post('/updateProduct/', (req, res) => {
  const { id, text, price, category, tags } = req.body;

  if (isValidInput(text, price)) {
    axios.post(`${backendPath}/updateProduct`, {
      id,
      newAttributes: { id, text, price, category, tags },
    })
      .then(response => {
        res.redirect('/products');
      })
      .catch(error => {
        console.log(error);
        res.redirect('/products');
      });
  } else {
    res.redirect(`/updateProduct/${id}`);
  }
});

app.get('/delete/:id', (req, res) => {
  axios.delete(`${backendPath}/deleteProduct/${req.params['id']}`)
    .then(response => {
      res.redirect(`/products`);
    })
    .catch(error => {
      console.log(error);
      res.redirect(`/products`);
    });
});

app.listen(PORT, () => {
  console.log(`Server ready ${PORT}`)
});

const loadProducts = (res, path) => {
  axios.get(`${backendPath}/${path}`)
    .then(response => {
      const view = constructProductsView(response, { includeCategory: true });
      res.send(readViewByName('products').replace('#{proizvodi}', view));
    })
    .catch(error => {
      console.log(error);
    });
}

// Dodajemo sve view-ove u jedan veliki string
const constructProductsView = (response, options) => {
  return response.data.reduce((previousElement, element) => previousElement + constructProduct(element, options), '');
}

// Pravimo view za dati proizvod
const constructProduct = (element, options = {}) => {
  const { id, text, price, currency, category } = element;

  return `
  <div class='proizvod'>
    <a href='/products/${id}'>
    <div>
      <div class='tekst'>${text}</div>
      <div class='cena'>${Number(price).toLocaleString()} ${currency}</div>
    </div>
    </a>
    ${options.includeCategory ? `
        <a href='/products/category/${category}'><div class='natpis'>${category}</div></a>
    `: ``}
    <div class='dugmici'>
      ${!options.ignoreUpdate ? `
        <a href='/updateProduct/${id}'>
          <button>
            Izmeni
          </button>
        </a>
        `: ``}
      ${!options.ignoreDelete ? `
        <a href='/delete/${id}'>
          <button class='delete'>
            Obriši
          </button>
        </a>
        `: ``}
    </div>
  </div>
`;
}

const isValidInput = (text, price) => {
  const hasText = text !== '';
  const isPriceValid = new RegExp(/^[1-9]\d{0,7}(?:\.\d{1,4})?$/g).test(price);
  return hasText && isPriceValid;
}