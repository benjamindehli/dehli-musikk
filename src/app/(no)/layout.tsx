import { LangProvider } from 'lib/LangContext';
import NavigationBar from 'components/partials/NavigationBar';
import Footer from 'components/partials/Footer';
import style from 'App.module.scss';

export default function NoLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="no">
            <body>
                <LangProvider lang="no">
                    <NavigationBar />
                    <div className={style.container}>
                        <main style={{ minHeight: '100vh' }}>
                            {children}
                        </main>
                        <Footer lang="no" />
                    </div>
                </LangProvider>
            </body>
        </html>
    );
}
