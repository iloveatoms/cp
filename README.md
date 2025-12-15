This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Deploy the Server:

> 1. Build static files | set `"module":"esnext"` in package, and then
```bash
/cp/webapp/complaint-portal $ npm run build
```
> Start NodeJS webserver | set `"module":"commonjs"` in package.json, with this running..., in another terminal
```bash
/cp/webapp/complaint-portal $ npm run dev
```
> Start Database API
```bash
/cp/server $ python server.py
```

Open [http://localhost:5000](http://localhost:5000) 😀



## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
