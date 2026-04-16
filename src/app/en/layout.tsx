import { LangProvider } from 'lib/LangContext';
import NavigationBar from 'components/partials/NavigationBar';
import Footer from 'components/partials/Footer';
import style from 'App.module.scss';

export default function EnLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <LangProvider lang="en">
                    <NavigationBar />
                    <div className={style.container}>
                        <main style={{ minHeight: '100vh' }}>
                            {children}
                        </main>
                        <Footer lang="en" />
                    </div>
                </LangProvider>
            </body>
        </html>
    );
}
