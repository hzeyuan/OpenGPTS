import { BsDownload } from "react-icons/bs";
import Image from "next/image";
// import extensionSrc from "@/public/extension.png";

export default () => {
  return (
    <section className="relatve">
      <div className="w-full px-5 py-2 mx-auto max-w-7xl">
        <h2 className="mt-8 mb-4 text-3xl font-bold text-center md:text-7xl md:mt-24">
          Third-party GPTs shows on browser sidebar
          <p className="mt-8">
            <a
              href="https://gpts-works.s3.us-west-1.amazonaws.com/extension/gpts-works_1.0.3.zip"
              className="inline-block px-4 py-2 text-lg border md:px-8 md:py-4 bg-slate-50 border-primary rounded-xl"
            >
              <span className="flex items-center ">
                <BsDownload className="mr-2 font-bold" />
                Download extension
              </span>
            </a>
          </p>
        </h2>
        <div className="mt-8 md:mt-16">
          {/* <Image src={extensionSrc} alt="extension" className="" /> */}
        </div>
      </div>
    </section>
  );
};