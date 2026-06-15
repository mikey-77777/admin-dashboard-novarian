type ContentPlaceholderProps = {
  title: string;
  sourceUrl: string;
};

export default function ContentPlaceholder({
  title,
  sourceUrl,
}: ContentPlaceholderProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm font-medium text-brand-400">Reverse: 1999 Content</p>
      <h1 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
        Mục này đã được đặt đúng cấu trúc navigation. Form nhập liệu riêng sẽ
        được bổ sung sau khi hoàn tất Characters.
      </p>
      <a
        className="mt-5 inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04]"
        href={sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        Xem source tham khảo
      </a>
    </div>
  );
}
