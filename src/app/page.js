import styles from './page.module.scss';
import LoginForm from "@/components/login-form/login-form.jsx";

const Home = () => {
    return (
        <section className={styles.login}>
            <h1>Welcome to the DRAFT</h1>
            <LoginForm/>
        </section>
    );
}

export default Home;