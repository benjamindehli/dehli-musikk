/*
 * The Cloudflare Web Analytics beacon.
 *
 * Chosen over the automatic injection Cloudflare offers on a proxied zone
 * because the zone already has a Worker on its routes: what the edge rewrites
 * into a Worker response is not something this repository controls or can test,
 * and analytics that silently stop reporting after an unrelated Worker change
 * are worse than none. Declared here, it ships with the export and is visible
 * in git. If automatic setup is ever turned on in the dashboard as well, turn
 * one of the two off - two beacons double every page view.
 *
 * No cookies, no fingerprinting and no cross site identifiers, so it needs no
 * consent banner.
 *
 * Where it reports to follows from that choice, and not from the zone being
 * proxied: Cloudflare's own injection posts to /cdn-cgi/rum on this site's
 * origin, while a manually installed snippet like this one posts to
 * cloudflareinsights.com/cdn-cgi/rum. That host is named in connect-src in
 * firebase.json for exactly this reason, and removing it does not disable
 * analytics so much as break them quietly - the script still loads, still runs,
 * and only the report is refused.
 *
 * The token is not a secret. It appears in the HTML of every page by design and
 * identifies the site, not the visitor, so it belongs in a repository variable
 * rather than a secret. It is read from the environment only so that a local
 * build or a fork does not report into the real site's numbers.
 *
 * Renders nothing when unset, which is what every build does until
 * NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN is configured. Referenced through the
 * whole `process.env.NAME` expression on purpose: Next replaces the literal
 * text at build time, and a destructured or computed lookup is not replaced,
 * which in a static export means the value is simply undefined at runtime.
 */
const token = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;

const Analytics = () => {
    if (!token) return null;

    return (
        <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token })}
            /*
             * Rocket Loader is on for this zone, and the first release proved it
             * does not spare this tag: the served HTML came back with
             * type="<hash>-text/javascript", which is Rocket Loader neutralising
             * a script so it can run it itself later.
             *
             * That is a bad trade here. The beacon reports on the window load
             * event, and Rocket Loader can get to a script after load has already
             * fired, which costs page load timings and undercounts views. The
             * beacon Cloudflare injects itself is exempt; one shipped in the page
             * like this is not, and data-cfasync="false" is how a script opts out.
             */
            data-cfasync="false"
        />
    );
};

export default Analytics;
