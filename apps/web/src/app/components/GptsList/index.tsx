"use client";

import { LazyLoadImage } from "react-lazy-load-image-component";
import Link from "next/link";
import { Gpts } from "../../types/gpts";
import moment from "moment";

interface Props {
  gpts: Gpts[];
  loading: boolean;
}

export default ({ gpts, loading }: Props) => {
  return (
    <section className="relative">
      <div className="px-5 py-4 mx-auto max-w-7xl md:px-10 md:py-4 lg:py-4">
        {!loading ? (
          <div className="mb-8 gap-5 py-4 [column-count:1] md:mb-12 md:[column-count:2] lg:mb-16 lg:[column-count:3]">
            {gpts.map((item: any, idx: number) => {
              return (
                <Link href={`/g/${item.uuid}`} target="_self" key={idx}>
                  <div className="mb-6 gap-6 overflow-hidden rounded-2xl border border-solid border-[#7e7e7e] bg-white p-8">
                    <div className="flex flex-row mb-4">
                      <LazyLoadImage
                        src={item.avatar_url}
                        alt=""
                        className="inline-block object-cover w-16 h-16 mr-4 rounded-full"
                      />
                      <div className="flex flex-col">
                        <h6 className="text-base font-semibold">{item.name}</h6>
                        <p className="text-sm text-[#636262]">
                          {item.author_name}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4 text-sm text-[#636262]">
                      {item.description}
                    </p>

                    <div className="flex items-center">
                      {item.rating &&
                        Array.from({ length: 5 }).map((_, idx: number) => (
                          <img
                            key={idx}
                            src="/star.svg"
                            alt=""
                            className="mr-1.5 inline-block w-4 flex-none"
                          />
                        ))}
                      <div className="flex-1"></div>

                      <p className="text-sm text-slate-500">
                        {moment(item.created_at).fromNow()}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto text-center">Loading data...</div>
        )}
      </div>
    </section>
  );
};
