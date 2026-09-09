import parse, { Element } from "html-react-parser";

interface HTMLProps {
  htmlString: string;
}

export function parseHTMLString(htmlString: string) {
  const reactNodes = parse(htmlString, {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === "img") {
        const imgUrl = domNode.attribs.src;
        const alt = domNode.attribs.alt || "";
        return (
          <img src={imgUrl} alt={alt} className="object-cover object-center" />
        );
      }
    },
  });

  return <div className="w-30">{reactNodes}</div>;
}
