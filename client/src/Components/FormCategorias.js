import React, {useState, useEffect} from 'react';

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { useFormik, FormikProvider, FieldArray } from "formik";

function FormCategorias() {

    const validate = values => {
        const errors = {};

        console.table(errors);
        return errors;
    }

    const formik = useFormik({
        initialValues: {

        },
        validate,
        onSubmit: values => {

        },
    });

    return (
        <>
            <FormikProvider>
                <FieldArray/>
            </FormikProvider>
        </>
    )
}

export default FormCategorias;
