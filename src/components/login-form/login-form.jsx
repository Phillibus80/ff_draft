'use client';

import {useFormState} from "react-dom";
import styles from './login-form.module.scss';
import {authenticate} from "@/app/actions/actions.js";

const LoginForm = () => {
    const [, formAction] = useFormState(authenticate, {message: null});

    return (
        <form action={formAction} className={styles.login_form}>
            <input name='username' type="text" placeholder='Username'/>
            <input name='password' type="password" placeholder='Password'/>

            <input type='submit' value='Log in'/>
        </form>
    );
}

export default LoginForm;