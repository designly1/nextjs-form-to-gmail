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
NEXT_PUBLIC_GMAIL_USER=example@gmail.com
NEXT_PUBLIC_GMAIL_PASS=your_gmail_app_password
```

#### Step 2 - Create Our Back-End Form Handler

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
import axios from 'axios';

const nodemailer = require("nodemailer");

// Config
const mailConfig = {
    host: "smtp.gmail.com",
    port: 465, // or 587
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.NEXT_PUBLIC_GMAIL_USER, // your gmail account
        pass: process.env.NEXT_PUBLIC_GMAIL_PASS // your gmail app password
    }
}

const adminEmail = 'The Webmaster <example@gmail.com>';

// Function for grabbing template files
async function getPubFile(file) {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}${file}`);
    return res.data;
}

export default async function handler(req, res) {
    sendEmails(req, res);
}

async function sendEmails(req, res) {
    // Create our Nodemailer transport handler
    let transporter = nodemailer.createTransport(mailConfig);

    // Fetch our template files
    const template = await getPubFile("/email-templates/template.html");
    const custHtml = await getPubFile("/email-templates/customer.html");
    const adminHtml = await getPubFile("/email-templates/admin.html");
    const custTxt = await getPubFile("/email-templates/customer.txt");
    const adminTxt = await getPubFile("/email-templates/admin.txt");

    // Format our recipient email address
    const recipEmail = `${req.body.name} <${req.body.email}>`;

    // Format our customer-bound email from received form data
    let sendHtml = template.replace("%BODY%", custHtml)
        .replace("%NAME%", req.body.name)
        .replace("%EMAIL%", req.body.email)
        .replace("%MESSAGE%", req.body.message);

    let sendTxt = custTxt
        .replace("%NAME%", req.body.name)
        .replace("%EMAIL%", req.body.email)
        .replace("%MESSAGE%", req.body.message);

    // Send our customer-bound email
    let info = await transporter.sendMail({
        from: adminEmail,
        to: recipEmail, // list of receivers
        subject: "Message Received ✔", // Subject line
        text: sendTxt, // plain text body
        html: sendHtml, // html body
    });

    if (!info.messageId) {
        res.status(200).json({ status: 0, message: "Failed to send message!" });
        return false;
    }

    sendHtml = template.replace("%BODY%", adminHtml)
        .replace("%NAME%", req.body.name)
        .replace("%EMAIL%", req.body.email)
        .replace("%MESSAGE%", req.body.message);

    sendTxt = adminTxt
        .replace("%NAME%", req.body.name)
        .replace("%EMAIL%", req.body.email)
        .replace("%MESSAGE%", req.body.message);

    info = await transporter.sendMail({
        from: recipEmail,
        to: adminEmail, // list of receivers
        subject: req.body.subject ? req.body.subject : "New Message From Website ✔", // Subject line
        text: sendTxt, // plain text body
        html: sendHtml, // html body
    });

    if (info.messageId) {
        res.status(200).json({ status: 1 });
    } else {
        res.status(200).json({ status: 0, message: "Failed to send message!" });
    }
}
```

#### Step 3 - Modify Our Front-End Form to Submit to Our API

Assuming you have completed the [first tutorial](https://designly.biz/blog/post/next-js-kick-ass-form-handling-using-react-hook-form-yup-and-bootstrap), edit the `/pages/index.js` to look like this:

```js
import React from 'react';
import Link from 'next/link';
import { Col, Container, Row, Navbar, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from 'axios';

export default function Home() {
  // Initialize our states
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Yup error message overrides
  const errMess = {
    req: "Please fill this out"
  };

  // Our Yup Schema for this form
  const ContactSchema = yup.object().shape({
    name: yup.string()
      .label('Full Name')
      .required(errMess.req)
      .min(3)
      .max(20),
    email: yup.string()
      .label('Email Address')
      .required(errMess.req)
      .email('Invalid Email Address'),
    message: yup.string()
      .label('Message')
      .required(errMess.req)
      .min(10)
      .max(1000),
  });

  // Destruct useForm() and set our Yup schema as the validation resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ContactSchema)
  });

  // Send our valid form data to our back-end API
  const submitForm = async (data) => {
    setIsSubmitting(true);
    
    const res = await axios({
      method: 'POST',
      url: '/api/contact-form',
      data: data
    }).then((res) => {
      setIsSubmitting(false);
      return res;
    }).catch((e) => {
      alert("An error occurred. See log for details.")
      console.error(e);
    });

    if (res.data.status === 1) {
      setIsSubmitted(true);
    } else {
      alert(res.data.message);
    }
  };

  return (
    <>
      <Navbar bg="dark" expand="lg">
        <Navbar.Brand>
          <Link href="/">
            Home
          </Link>
        </Navbar.Brand>
      </Navbar>
      <Container>
        {!isSubmitted ?
          <>
            <h1 className='mb-5'>Next.JS Form to Email Example</h1>
            <Form onSubmit={handleSubmit((data) => submitForm(data))}>
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="nameField">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. John Doe"
                      isInvalid={errors.name}
                      {...register('name')}
                    />
                    <Form.Control.Feedback type='invalid'>
                      {errors.name?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="emailField">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="e.g. john@example.com"
                      isInvalid={errors.email}
                      {...register('email')}
                    />
                    <Form.Control.Feedback type='invalid'>
                      {errors.email?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col lg={12}>
                  <Form.Group className="mb-3" controlId="messageField">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      placeholder="Please type your message..."
                      isInvalid={errors.message}
                      {...register('message')}
                    />
                    <Form.Control.Feedback type='invalid'>
                      {errors.message?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </>
          :
          <>
            <h1>Thank you!</h1>
            <p>Your message has been received. Please check your email for confirmation.</p>
          </>
        }

      </Container>
    </>
  )
}
```

Run `npm run dev` and navigate to `https://localhost:300` and give 'er a whirl. Hopefully, you'll see this result:

![End Result 1](https://cdn.designly.biz/blog_files/simple-next-js-form-to-email-using-react-hook-form-and-gmail/image02.jpg)

![End Result 2](https://cdn.designly.biz/blog_files/simple-next-js-form-to-email-using-react-hook-form-and-gmail/image01.jpg)


***

Well, it's been quite a journey! We now have a complete self-contained app that will collect data from a website user and then email it to the admin. And we require no third-party services except Gmail (which is free) and Vercel (which is also free) to host your app.

For more great information, please visit the [Designly Blog](https://designly.biz/blog).