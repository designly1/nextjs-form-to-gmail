There are many paid form handling API services out there. Some service have free-tier accounts, but are very limited. But who wants to pay for the simple function of sending a form to an email address?

If all you want to do is collect information from a website user and email it to yourself and also send a confirmation email to the user, and you don't need any database storage, then this tutorial is for you!

This tutorial is part two of a series on creating web forms using `Next.JS`, `React-Hook-Form`, `Yup` and `Bootstrap`. You'll want to read the first article, *[Next.JS - Kick-Ass Form Handling Using React-Hook-Form, Yup and Bootstrap](https://designly.biz/blog/post/next-js-kick-ass-form-handling-using-react-hook-form-yup-and-bootstrap)*, before proceeding.

#### Step 1 - Set Up Our Environment

First we need to add a couple additional packages to our project to handle the back-end of our form.

```bash
npm install nodemailer axios
````

Now, to use your Gmail account as a form mailer, you'll need to log in to your Google account and set up an `App Password` for the back-end API to use. If you're unsure how to do this, check out [This Tutorial](https://support.google.com/accounts/answer/185833?hl=en).

Next, let's set up our local dev environment. Create a file in the root directory called `.env.local`:

```text
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_GMAIL_PASS=your_gmail_app_password
```

#### Step 3 - Create Our Back-End Form Handler

Ok, the first thing we need to do is create a back-end API endpoint to handle our form data and send it to our gmail account.

Create a folder in the `public` folder called `email-templates`. These templates will be used by the API backend. Each email will have an HTML and Plaintext version.

`template.html:`

This file will be used by all email templates.

```html
<!DOCTYPE html>
<html>

<head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: #171717;
            color: #d8d8d8;
            font-family: 'Montserrat', sans-serif;
            padding: 1em;
        }
    </style>
</head>

<body>
%BODY%
</body>

</html>
```

`admin.html:`

```html
<h1>New Message From Website</h1>
<p>The following information was submitted:</p>
<p>Name: %NAME%</p>
<p>Email: %EMAIL%</p>
<p>Message:</p>
<p>%MESSAGE%</p>
```

`admin.txt:`

```text
New Message From Website

The following information was submitted:

Name: %NAME%
Email: %EMAIL%
Message:
%MESSAGE%
```

`customer.html:`

```html
<h1>We Received Your Message!</h1>
<p>Dear %NAME%:</p>
<p>Thank you for inquiring. We just wanted to let you know that we've received your message and will be responding soon.
</p>
<p>Have a great day!</p>
<p>The Webmaster</p>
```

`customer.txt:`

```text
Message Received!

Dear %NAME%:

Thank you for inquiring. We just wanted to let you know that we've received your message and will be responding soon.

Have a great day!

- The Webmaster
```

Now let's create a file called `contact-form.js` in the `/pages/api/` directory:

```js
