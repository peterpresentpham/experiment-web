import { defineMessages } from '../define';

type TFnDoc = { description: string; params: Record<string, string>; returns: string };

export const formatNumberMessages = defineMessages<{
  params: string;
  returns: string;
  methods: string;
  example: string;
  result: (value: string) => string;
  numberPlaceholder: string;
  on: string;
  off: string;
  gettingStarted: { title: string; intro: string; arithmetic: string; installation: string };
  fn: Record<
    | 'round'
    | 'compact'
    | 'parseNum'
    | 'clearLeadingZero'
    | 'clearTrailingZero'
    | 'clearUnnecessaryZero'
    | 'scientific'
    | 'subscript'
    | 'FN',
    TFnDoc
  >;
  fnMethods: Record<'round' | 'compact' | 'prefix' | 'suffix' | 'toNumber', string>;
  types: {
    NumberType: string;
    RoundingMode: string;
    roundingModes: Record<'half' | 'up' | 'down' | 'truncate' | 'banker', string>;
    NotationMode: string;
    SignType: string;
    RoundingConfigType: string;
    rounding: string;
    precision: string;
    NumberConfigType: string;
    prefix: string;
    suffix: string;
    notation: string;
    ObjectNumberType: string;
    compactedSymbol: string;
    FormattingConfigType: string;
    isCompact: string;
    FNType: string;
    fnMembers: Record<
      'round' | 'compact' | 'notation' | 'prefix' | 'suffix' | 'toNumber' | 'toObject',
      string
    >;
    ParseNumberParamsType: string;
    fallback: string;
  };
}>({
  en: {
    params: 'Params',
    returns: 'Returns',
    methods: 'Methods',
    example: 'Example',
    result: (value) => `Result: ${value}`,
    numberPlaceholder: 'Number',
    on: 'ON',
    off: 'OFF',
    gettingStarted: {
      title: 'Getting started',
      intro:
        'A lightweight, zero-dependency JavaScript/TypeScript library for precise number formatting. Designed for financial applications, crypto dashboards, and scientific data where precision is paramount.',
      arithmetic:
        'Unlike standard libraries that rely on floating-point math, the library uses internal string-based arithmetic to handle numbers of any size (string, number and bigint) without losing a single decimal place.',
      installation: 'Installation',
    },
    fn: {
      round: {
        description: 'Rounds a number based on the specified precision and rounding mode.',
        params: {
          value: 'The value to be rounded. Can be a number, string, or bigint.',
          options: 'Configuration for rounding.',
        },
        returns: '(string): The rounded number as a string.',
      },
      compact: {
        description:
          'Formats a number into a short, human-readable string with a suffix (e.g., K, M, B).',
        params: {
          value: 'The value to be compacted. Can be a number, string, or bigint.',
          options: 'Configuration for rounding the compacted value.',
        },
        returns: '(string): The compacted number with a suffix as a string.',
      },
      parseNum: {
        description:
          'Parses various input formats into a standard decimal string. Supports currencies ($€£¥), commas, underscores, scientific notation (e+), and custom subscript notation.',
        params: {
          value: 'The input value to parse. Can be a number, string, or bigint.',
          options: 'Parsing options.',
        },
        returns: '(string): A standardized decimal string (e.g., "1234.56").',
      },
      clearLeadingZero: {
        description: "Removes leading zeros from a string (e.g., '005' -> '5').",
        params: { value: 'The number string to clean.' },
        returns: '(string): The cleaned number string.',
      },
      clearTrailingZero: {
        description: "Removes trailing zeros from a decimal string (e.g., '1.500' -> '1.5').",
        params: { value: 'The number string to clean.' },
        returns: '(string): The cleaned number string.',
      },
      clearUnnecessaryZero: {
        description: 'Removes redundant leading and trailing zeros from a number string.',
        params: { value: 'The number string to clean.' },
        returns: '(string): The cleaned number string.',
      },
      scientific: {
        description: 'Formats a number string using standard scientific notation (e.g., 1.23e+5).',
        params: { value: 'The number string to format.' },
        returns: '(string): The number string in scientific notation.',
      },
      subscript: {
        description:
          'Formats the decimal part of small numbers using subscript characters to represent leading zeros (e.g., 0.0₄123).',
        params: { value: 'The number string to format.' },
        returns: '(string): The number string in subscript notation.',
      },
      FN: {
        description:
          'Fluent API for performing multiple formatting operations in a readable chain.',
        params: { value: 'The initial value to format. Can be a number, string, or bigint.' },
        returns: 'A chainable object for further formatting.',
      },
    },
    fnMethods: {
      round: 'Sets the rounding strategy and precision.',
      compact: 'Formats the number into a short, human-readable string (K, M, B).',
      prefix: 'Prepends a string (e.g., "$").',
      suffix: 'Appends a string (e.g., " units").',
      toNumber: 'Returns the final formatted string.',
    },
    types: {
      NumberType: 'Supported input types for number formatting.',
      RoundingMode: 'Strategies for rounding numbers.',
      roundingModes: {
        half: 'Round to the nearest neighbor. If equidistant, round away from zero.',
        up: 'Round towards positive infinity.',
        down: 'Round towards negative infinity.',
        truncate: 'Round towards zero.',
        banker: 'Round to the nearest even neighbor (statistical rounding).',
      },
      NotationMode: 'Modes for special numerical notation.',
      SignType: 'Possible sign values for the internal number representation.',
      RoundingConfigType: 'Configuration for rounding operations.',
      rounding: 'The rounding strategy to use.',
      precision: 'Number of decimal places to keep.',
      NumberConfigType: 'Configuration for basic number display properties.',
      prefix: "Text to prepend to the number (e.g., '$').",
      suffix: "Text to append to the number (e.g., ' units').",
      notation: 'The notation style to apply.',
      ObjectNumberType: 'Internal object structure containing the full formatting state.',
      compactedSymbol: "The symbol used for compact notation (e.g., 'K', 'M').",
      FormattingConfigType: 'Full configuration options for the formatNumber function.',
      isCompact: 'Whether to use compact notation (K, M, B, etc.).',
      FNType: 'Fluent API interface for chainable number formatting operations.',
      fnMembers: {
        round: 'Rounds the number based on the provided precision and strategy.',
        compact: 'Converts the number to a compact representation (e.g., 1K, 1M, 1B).',
        notation: 'Sets the notation style for the number (e.g., scientific, subscript).',
        prefix: 'Adds a prefix to the formatted number string.',
        suffix: 'Adds a suffix to the formatted number string.',
        toNumber: 'Finalizes the chain and returns the formatted number as a string.',
        toObject: 'Returns the internal state of the number as an ObjectNumberType.',
      },
      ParseNumberParamsType: 'Configuration for input parsing.',
      fallback: "Value to return if parsing fails. Default is '--'.",
    },
  },
  vi: {
    params: 'Tham số',
    returns: 'Giá trị trả về',
    methods: 'Phương thức',
    example: 'Ví dụ',
    result: (value) => `Kết quả: ${value}`,
    numberPlaceholder: 'Số',
    on: 'BẬT',
    off: 'TẮT',
    gettingStarted: {
      title: 'Bắt đầu',
      intro:
        'Thư viện JavaScript/TypeScript nhẹ, không phụ thuộc thư viện nào khác, dùng để định dạng số chính xác. Thiết kế cho ứng dụng tài chính, dashboard crypto và dữ liệu khoa học, nơi độ chính xác là quan trọng nhất.',
      arithmetic:
        'Khác với các thư viện thông thường dựa vào số thực dấu phẩy động, thư viện này tính toán trên chuỗi ký tự, nên xử lý được số ở mọi độ lớn (string, number và bigint) mà không mất một chữ số thập phân nào.',
      installation: 'Cài đặt',
    },
    fn: {
      round: {
        description: 'Làm tròn số theo độ chính xác và kiểu làm tròn cho trước.',
        params: {
          value: 'Giá trị cần làm tròn. Có thể là number, string hoặc bigint.',
          options: 'Cấu hình làm tròn.',
        },
        returns: '(string): Số đã làm tròn, dạng chuỗi.',
      },
      compact: {
        description: 'Rút gọn số thành chuỗi ngắn, dễ đọc, có hậu tố (ví dụ K, M, B).',
        params: {
          value: 'Giá trị cần rút gọn. Có thể là number, string hoặc bigint.',
          options: 'Cấu hình làm tròn cho giá trị sau khi rút gọn.',
        },
        returns: '(string): Số đã rút gọn kèm hậu tố, dạng chuỗi.',
      },
      parseNum: {
        description:
          'Đọc nhiều định dạng đầu vào và chuyển về chuỗi thập phân chuẩn. Hỗ trợ ký hiệu tiền tệ ($€£¥), dấu phẩy, gạch dưới, ký hiệu khoa học (e+) và ký hiệu chỉ số dưới riêng của thư viện.',
        params: {
          value: 'Giá trị đầu vào cần đọc. Có thể là number, string hoặc bigint.',
          options: 'Tuỳ chọn khi đọc.',
        },
        returns: '(string): Chuỗi thập phân chuẩn (ví dụ "1234.56").',
      },
      clearLeadingZero: {
        description: "Xoá các số 0 ở đầu chuỗi (ví dụ '005' -> '5').",
        params: { value: 'Chuỗi số cần làm gọn.' },
        returns: '(string): Chuỗi số đã làm gọn.',
      },
      clearTrailingZero: {
        description: "Xoá các số 0 ở cuối phần thập phân (ví dụ '1.500' -> '1.5').",
        params: { value: 'Chuỗi số cần làm gọn.' },
        returns: '(string): Chuỗi số đã làm gọn.',
      },
      clearUnnecessaryZero: {
        description: 'Xoá các số 0 thừa ở cả đầu và cuối chuỗi số.',
        params: { value: 'Chuỗi số cần làm gọn.' },
        returns: '(string): Chuỗi số đã làm gọn.',
      },
      scientific: {
        description: 'Định dạng chuỗi số theo ký hiệu khoa học chuẩn (ví dụ 1.23e+5).',
        params: { value: 'Chuỗi số cần định dạng.' },
        returns: '(string): Chuỗi số theo ký hiệu khoa học.',
      },
      subscript: {
        description:
          'Định dạng phần thập phân của số rất nhỏ, dùng chữ số chỉ số dưới để biểu diễn các số 0 ở đầu (ví dụ 0.0₄123).',
        params: { value: 'Chuỗi số cần định dạng.' },
        returns: '(string): Chuỗi số theo ký hiệu chỉ số dưới.',
      },
      FN: {
        description: 'API dạng chuỗi (fluent) để thực hiện nhiều bước định dạng liền nhau, dễ đọc.',
        params: { value: 'Giá trị ban đầu cần định dạng. Có thể là number, string hoặc bigint.' },
        returns: 'Một đối tượng có thể gọi nối tiếp để định dạng thêm.',
      },
    },
    fnMethods: {
      round: 'Đặt kiểu làm tròn và độ chính xác.',
      compact: 'Rút gọn số thành chuỗi ngắn, dễ đọc (K, M, B).',
      prefix: 'Thêm chuỗi vào trước (ví dụ "$").',
      suffix: 'Thêm chuỗi vào sau (ví dụ " units").',
      toNumber: 'Trả về chuỗi kết quả cuối cùng.',
    },
    types: {
      NumberType: 'Các kiểu đầu vào được hỗ trợ khi định dạng số.',
      RoundingMode: 'Các kiểu làm tròn số.',
      roundingModes: {
        half: 'Làm tròn về số gần nhất. Nếu cách đều, làm tròn ra xa số 0.',
        up: 'Làm tròn về phía dương vô cực.',
        down: 'Làm tròn về phía âm vô cực.',
        truncate: 'Làm tròn về phía 0 (cắt bỏ phần thừa).',
        banker: 'Làm tròn về số chẵn gần nhất (làm tròn kiểu thống kê).',
      },
      NotationMode: 'Các kiểu ký hiệu số đặc biệt.',
      SignType: 'Các giá trị dấu có thể có trong biểu diễn số bên trong thư viện.',
      RoundingConfigType: 'Cấu hình cho thao tác làm tròn.',
      rounding: 'Kiểu làm tròn sẽ dùng.',
      precision: 'Số chữ số thập phân giữ lại.',
      NumberConfigType: 'Cấu hình các thuộc tính hiển thị cơ bản của số.',
      prefix: "Chuỗi thêm vào trước số (ví dụ '$').",
      suffix: "Chuỗi thêm vào sau số (ví dụ ' units').",
      notation: 'Kiểu ký hiệu sẽ áp dụng.',
      ObjectNumberType: 'Cấu trúc đối tượng bên trong, chứa toàn bộ trạng thái định dạng.',
      compactedSymbol: "Ký hiệu dùng khi rút gọn (ví dụ 'K', 'M').",
      FormattingConfigType: 'Toàn bộ tuỳ chọn cấu hình của hàm formatNumber.',
      isCompact: 'Có dùng dạng rút gọn (K, M, B...) hay không.',
      FNType: 'Giao diện API dạng chuỗi cho các thao tác định dạng số nối tiếp.',
      fnMembers: {
        round: 'Làm tròn số theo độ chính xác và kiểu làm tròn cho trước.',
        compact: 'Chuyển số sang dạng rút gọn (ví dụ 1K, 1M, 1B).',
        notation: 'Đặt kiểu ký hiệu cho số (ví dụ scientific, subscript).',
        prefix: 'Thêm tiền tố vào chuỗi số đã định dạng.',
        suffix: 'Thêm hậu tố vào chuỗi số đã định dạng.',
        toNumber: 'Kết thúc chuỗi gọi và trả về số đã định dạng, dạng chuỗi.',
        toObject: 'Trả về trạng thái bên trong của số dưới dạng ObjectNumberType.',
      },
      ParseNumberParamsType: 'Cấu hình khi đọc đầu vào.',
      fallback: "Giá trị trả về khi đọc thất bại. Mặc định là '--'.",
    },
  },
});
