// import * as svgtojsx from "svg-to-jsx";
import * as QRCode from "qrcode-svg";
import React, { useEffect, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { bigSVG, smallSVG } from "./svgfiles";
// const QRCode = require("qrcode-svg-ts");
// const svgtojsx = require("svg-to-jsx");

function App() {
  const [combinedSVG, setCombinedSVG] = useState();
  const [bigSVGFile, setBigSVGFile] = useState(null);
  const [smallSVGFile, setSmallSVGFile] = useState(null);
  const [SVGFileStrings, setSVGFileStrings] = useState({
    small: null,
    big: null,
  });

  useEffect(() => {
    if (SVGFileStrings && SVGFileStrings.big) {
      mergeSVGImages(
        SVGFileStrings.big,
        SVGFileStrings.small,
        2562,
        449,
        891,
        891,
        3288,
        6690
      );
    }
  }, [SVGFileStrings]);

  useEffect(() => {
    if (bigSVGFile) {
      const bigSVGReader = new FileReader();

      bigSVGReader.onload = function (event) {
        const svgString = event.target.result;
        console.log({ svgString });
        setSVGFileStrings((prev) => ({ ...prev, big: svgString }));
      };
      bigSVGReader.readAsText(bigSVGFile);
    }
    if (smallSVGFile) {
      const smallSVGReader = new FileReader();

      smallSVGReader.onload = function (event) {
        const svgString = event.target.result;
        console.log({ svgString });
        setSVGFileStrings((prev) => ({ ...prev, small: svgString }));
      };
      smallSVGReader.readAsText(smallSVGFile);
    }
  }, [bigSVGFile, smallSVGFile]);

  const mergeSVGImages = (_bigSVG, _smallSVG, x2, y2, h2, w2, h1, w1) => {
    const svgString1 = _bigSVG;
    // const svgString1 = ReactDOMServer.renderToString(_bigSVG);
    const viewBox1 = svgString1.match(/\bviewBox=".*?"/);
    const modifiedContents1 = svgString1
      .replace(/<svg[^>]*>/, "")
      .replace(/<\/svg>/, "")
      .replace(/<\?xml.*?\?>/, "")
      .replace(/<!DOCTYPE[^>]*>/, "")
      .replace(/:([a-z-]+)/g, (match, p1) =>
        p1.replace(/-\w/g, (c) => c[1].toUpperCase())
      );
    console.log({ modifiedContents1 });

    const splittedVB1 = viewBox1[0].split(" ");
    const aspectRatio1 =
      parseInt(splittedVB1[2], 10) / parseInt(splittedVB1[3], 10);
    // const svgString2 = _smallSVG;
    const svgString2 = generateSVGQR();
    // const svgString2 = ReactDOMServer.renderToString(_smallSVG);
    const viewBox2 = svgString2.match(/\bviewBox=".*?"/);
    const modifiedContents2 = svgString2
      .replace(/<svg.*?>/, "")
      .replace(/<\/svg>/, "");
    const splittedVB2 = viewBox2[0].split(" ");
    const aspectRatio2 =
      parseInt(splittedVB2[2], 10) / parseInt(splittedVB2[3], 10);

    const mStrSMALL =
      `<svg x="${x2}" y="${y2}" width="${w2}" height="${Math.round(
        w2 / aspectRatio2
      )}" ${viewBox2[0]}>` +
      modifiedContents2 +
      `</svg>`;

    const mStrBIG =
      `<svg width="${w1}" height="${Math.round(w1 / aspectRatio1)}" ${
        viewBox1[0]
      }>` +
      modifiedContents1 +
      `</svg>`;

    const combinedSVG =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w1}" height="${Math.round(
        w1 / aspectRatio1
      )}" >` +
      mStrBIG +
      mStrSMALL +
      `</svg>`;
    setCombinedSVG(combinedSVG);
  };

  const generateSVGQR = () => {
    var qrcode = new QRCode({
      content: "http://github.com/",
      padding: 0,
      width: 256,
      height: 256,
      typeNumber: 4,
      color: "#000000",
      background: "#ffffff",
      ecl: "H", // L, M, H, Q
      join: true,
      // predefined: false,
      pretty: true,
      // swap: false, // swap X and Y modules
      xmlDeclaration: false,
      container: "svg-viewbox", // wrapping element
    });
    console.log({
      qrcode: qrcode.svg(),
    });

    return qrcode.svg();
  };

  const downloadSvg = (svgString) => {
    // Create a Blob from the SVG string
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    console.log({ blob });
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element to trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = "my_svg_file.svg";
    document.body.appendChild(link);

    // Click the link to trigger the download
    link.click();

    // Clean up the URL and link element
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        flexDirection: "column",
      }}
    >
      <label>
        SVG big
        <input
          type="file"
          accept=".svg"
          onChange={(e) => {
            setBigSVGFile(e.target.files[0]);
          }}
        />
      </label>
      <label>
        SVG small
        <input
          type="file"
          accept="image/svg+xml"
          onChange={(e) => {
            setSmallSVGFile(e.target.files[0]);
          }}
        />
      </label>
      <button onClick={() => downloadSvg(combinedSVG)}>download</button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: combinedSVG }} />

        {/* {combinedSVG && combinedSVG} */}
      </div>
    </div>
  );
}

export default App;
