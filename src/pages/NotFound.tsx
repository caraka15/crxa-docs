import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";

const NotFound = () => {
  return (
    <>
      <Seo
        title="404 Not Found"
        description="The requested page could not be located."
        canonical="/404"
        noindex
      />
      <div className="min-h-screen bg-base-100 flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-8xl mb-4 font-bold text-primary">404</div>
            <h1 className="text-4xl font-bold text-base-content mb-4">Page Not Found</h1>
            <p className="text-xl text-base-content/70 mb-8">
              The chain or page you're looking for doesn't exist.
            </p>
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
