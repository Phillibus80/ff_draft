import styles from './page.module.scss';
import LoginForm from "@/components/login-form/login-form.jsx";

const PageModule = async () => {
    return (
        <section className={styles.login}>
            <h1>Welcome Bitch</h1>
            <LoginForm/>
        </section>
    );
}

export default PageModule;