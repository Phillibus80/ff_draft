'use client';

import styles from './login-form.module.scss';
import {authenticate} from "@/app/actions/actions.js";
import {useRef} from "react";

const LoginForm = () => {
    const userNameRef = useRef();
    const passwordRef = useRef();

    const handleSubmit = async () => {
        await authenticate(userNameRef.current, passwordRef.current);
    }

    return (
        <form
            id="login-form"
            action={handleSubmit}
            className={styles.login_form}
        >
            <input
                onChange={event => {
                    userNameRef.current = event.target.value
                }}
                name='username'
                type="text"
                placeholder='Username'
                autoComplete='username'
            />
            <input
                onChange={event => {
                    passwordRef.current = event.target.value
                }}
                name='password'
                type="password"
                placeholder='Password'
                autoComplete='off'
            />

            <input id='submit-btn' type='submit' value='Log in'/>
        </form>
    );
}

export default LoginForm;