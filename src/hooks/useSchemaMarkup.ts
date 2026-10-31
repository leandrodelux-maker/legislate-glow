import { useEffect } from "react";

const useSchemaMarkup = (schema: Record<string, any>) => {
  useEffect(() => {
    const existingScript = document.querySelector('script[data-schema="page"]');
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "page");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [schema]);
};

export default useSchemaMarkup;
