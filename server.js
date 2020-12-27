const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();

const tickets = [
  {id: 1, name: 'Купить книгу', description: 'Найти в магазине книгу Аленкины сказки', status: false, time: '20.12.2020 12:20'},
  {id: 2, name: 'Приготовить ужин', description: 'Найти рецепт утки с яблоками', status: false, time: '10.10.2010 12:22'},
  {id: 3, name: 'Купить подарки', description: 'Собрать мешок конфет', status: false, time: '15.12.2020 12:23'},
];

let newId = 4;

app.use(koaBody({
    urlencoded: true,
    multipart: true,
  }));

  app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
      return await next();
    }
    const headers = { 'Access-Control-Allow-Origin': '*', };
  
    if (ctx.request.method !== 'OPTIONS') {
      ctx.response.set({...headers});
      try {
        return await next();
      } catch (e) {
        e.headers = {...e.headers, ...headers};
        throw e;
      }
    }
  
    if (ctx.request.get('Access-Control-Request-Method')) {
      ctx.response.set({
        ...headers,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
      });
  
      if (ctx.request.get('Access-Control-Request-Headers')) {
        ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
      }
      ctx.response.status = 204;
    }
  });

app.use(async ctx => {
    ctx.response.body ='server response';

    const method = ctx.request.query.method;

    switch (method) {
        case 'allTickets':
            ctx.response.body = tickets;
            return;
        case 'ticketById':
          const id = Number(ctx.request.query.id);
          const ticket = tickets.find(elem => id === elem.id);
          ctx.response.body = ticket;
          return;
        case 'createTicket':
           if (ctx.request.query.id) {
             const { name, description, time, status } = ctx.request.body;
             const editId = Number(ctx.request.query.id);
             tickets.forEach((elem) => {
               if (editId === elem.id) {
                 if (!name) {
                   elem.status = status;
                 } else {
                  elem.name = name;
                  elem.description = description;
                  elem.time = time;
                  elem.status = status;
                 }  
               }
             });
           } else {
             tickets.push(Object.assign({id: newId}, ctx.request.body));
             newId += 1;
           }
           ctx.response.body = true;
           return;
        case 'delTicketById':
          const delid = Number(ctx.request.query.id);
          const index = tickets.findIndex(elem => delid === elem.id);
          tickets.splice(index, 1);
          ctx.response.body = true;
          return;
        default:
            ctx.response.status = 404;
            return;
    }
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);