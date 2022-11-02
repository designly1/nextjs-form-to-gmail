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
