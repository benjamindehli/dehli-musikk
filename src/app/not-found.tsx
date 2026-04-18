import style from 'components/routes/NotFound.module.scss';

export const metadata = {
    title: '404 - Siden finnes ikke - Dehli Musikk',
    robots: { follow: true, index: false, archive: false }
};

export default function NotFound() {
    return (
        <html lang="no">
            <body>
                <div className={style.contentSection}>
                    <h1>404 - Siden finnes ikke</h1>
                </div>
            </body>
        </html>
    );
}
