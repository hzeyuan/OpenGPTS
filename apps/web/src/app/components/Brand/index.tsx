"use client";

interface Props {
  count: number;
}

export default function({ count }: Props) {
  return (
    <section className="relatve">
      <div className="w-full px-4 mx-auto mt-12 max-w-7xl md:mt-24">
        <div className="w-full max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold md:text-7xl">
            Third-party GPTs store
          </h2>
          <p className="mt-4 mb-4 md:mt-12 md:mb-8 text:lg md:text-4xl">
            <span className="font-bold text-primary">{count}</span> fantastic
            GPTs stored
            <a
              className="mx-2 text-sm text-primary"
              href="https://github.com/all-in-aigc/gpts-works/issues/5"
              rel="noopener" target="_blank"
            >
              Submit yours 👉
            </a>
          </p>
        </div>
      </div>
      <img
        alt=""
        className="absolute bottom-[auto] left-[auto] right-0 top-24 -z-10 inline-block max-[767px]:hidden"
        src="/bgstar.svg"
      />
      <img
        alt=""
        className="absolute bottom-[auto] right-[auto] left-0 top-60 -z-10 inline-block max-[767px]:hidden"
        src="/bgstar.svg"
      />
    </section>
  );
};
