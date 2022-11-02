import React from 'react';
import Link from 'next/link';
import { Col, Container, Row, Navbar, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

export default function Home() {
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

  // Our function for handling valid form data
  const submitForm = (data) => {
    alert(JSON.stringify(data));
  }

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
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Col>
          </Row>
        </Form>

      </Container>
    </>
  )
}
