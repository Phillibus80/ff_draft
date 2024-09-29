'use client';

import {useFormState} from "react-dom";
import styles from './login-form.module.scss';
import {authenticate} from "@/app/actions/actions.js";
import {useRef} from "react";

const LoginForm = () => {
    const userNameRef = useRef();
    const passwordRef = useRef();

    const [, formAction] = useFormState(authenticate, {message: null});

    return (
        <form
            action={() => {
                console.log('Username:: ', userNameRef.current)
                console.log('Password:: ', passwordRef.current)
                authenticate(userNameRef.current, passwordRef.current)
                    .then(res => console.log('Res:: ', res))
            }}
            className={styles.login_form}
        >
            <input
                onChange={event => {
                    userNameRef.current = event.target.value
                }}
                name='username'
                type="text"
                placeholder='Username'
            />
            <input
                onChange={event => {
                    passwordRef.current = event.target.value
                }}
                name='password'
                type="password"
                placeholder='Password'
            />

            <input type='submit' value='Log in'/>
        </form>
    );
}

export default LoginForm;