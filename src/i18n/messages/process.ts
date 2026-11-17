import { ProcessStatusType, SchedulerModeType, TProcessStoreStatus } from 'src/types/process.type';
import { defineMessages } from '../define';

export const processMessages = defineMessages<{
  meta: { title: string; description: string };
  schedulers: Record<SchedulerModeType, string>;
  processStatus: Record<ProcessStatusType, string>;
  storeStatus: Record<TProcessStoreStatus, string>;
  statusBadge: (status: string) => string;
  run: string;
  rerun: string;
  pause: string;
  columnView: string;
  chartView: string;
  empty: string;
  import: string;
  export: string;
  reset: string;
  data: {
    trigger: string;
    title: string;
    processes: string;
    addProcess: string;
    clearAll: string;
    saveChanges: string;
    arrivalTime: string;
    executionTime: string;
    addBlockTask: string;
    start: string;
    duration: string;
    deleteProcess: string;
    deleteBlockTask: string;
    errors: { arrivalMin: string; executionMin: string; executionMax: string };
  };
  importDialog: {
    title: string;
    upload: string;
    alternative: string;
    quickStart: string;
    loadExample: string;
    loadExampleHint: string;
    template: string;
    invalidJson: string;
  };
  settings: {
    open: string;
    title: string;
    scheduler: string;
    maxBlockTasks: string;
    displayMode: string;
    displayModes: { chart: string; column: string };
  };
  metrics: {
    trigger: string;
    title: string;
    avgTurnaround: string;
    avgWaiting: string;
    avgResponse: string;
    turnaround: string;
    waiting: string;
    response: string;
    empty: string;
  };
  queues: {
    incoming: string;
    ready: string;
    waiting: string;
    terminated: string;
    noIncoming: string;
    emptyQueue: string;
    noWaiting: string;
    noTerminated: string;
  };
  core: { title: (mode: string) => string; active: string; idle: string };
  item: {
    priority: (value: number) => string;
    waiting: (value: number) => string;
    arrival: string;
    start: string;
    end: string;
    cpu: string;
    nextTask: string;
    blockedTasks: (count: number) => string;
    task: (index: number) => string;
  };
  chart: {
    empty: string;
    title: string;
    time: string;
    status: string;
    running: string;
    blocked: string;
  };
}>({
  en: {
    meta: {
      title: 'Process Scheduler',
      description: 'Visualize how an operating system schedules processes across CPU cores.',
    },
    schedulers: {
      [SchedulerModeType.FIFO]: 'First In, First Out',
      [SchedulerModeType.SJF]: 'Shortest Job First',
      [SchedulerModeType.ROUND_ROBIN]: 'Round Robin',
      [SchedulerModeType.MLFQ]: 'Multilevel Feedback Queue',
    },
    processStatus: {
      [ProcessStatusType.NEW]: 'new',
      [ProcessStatusType.READY]: 'ready',
      [ProcessStatusType.RUNNING]: 'running',
      [ProcessStatusType.WAITING]: 'waiting',
      [ProcessStatusType.TERMINATED]: 'terminated',
    },
    storeStatus: {
      initial: 'initial',
      ready: 'ready',
      running: 'running',
      pause: 'paused',
      ended: 'ended',
    },
    statusBadge: (status) => `Status: ${status}`,
    run: 'Run',
    rerun: 'Rerun',
    pause: 'Pause',
    columnView: 'Column view',
    chartView: 'Chart view',
    empty: 'No processes created yet.',
    import: 'Import',
    export: 'Export',
    reset: 'Reset',
    data: {
      trigger: 'Data',
      title: 'Update processes',
      processes: 'Processes',
      addProcess: '+ Add process',
      clearAll: 'Clear all',
      saveChanges: 'Save changes',
      arrivalTime: 'Arrival time',
      executionTime: 'Execution time',
      addBlockTask: '+ Add block task',
      start: 'Start',
      duration: 'Duration',
      deleteProcess: 'Delete process',
      deleteBlockTask: 'Delete block task',
      errors: {
        arrivalMin: 'Arrival time must be at least 0',
        executionMin: 'Execution time must be at least 1',
        executionMax: 'Execution time must be at most 120',
      },
    },
    importDialog: {
      title: 'Data configuration',
      upload: 'Upload configuration',
      alternative: 'Alternative',
      quickStart: 'Quick start',
      loadExample: 'Load example data',
      loadExampleHint: 'Get started quickly with preset processes',
      template: 'JSON template',
      invalidJson: 'Invalid JSON file',
    },
    settings: {
      open: 'Open process settings',
      title: 'Process settings',
      scheduler: 'Scheduler mode',
      maxBlockTasks: 'Max block tasks per slice',
      displayMode: 'Display mode',
      displayModes: { chart: 'Chart', column: 'Column' },
    },
    metrics: {
      trigger: 'Metrics',
      title: 'Metrics',
      avgTurnaround: 'Avg turnaround',
      avgWaiting: 'Avg waiting',
      avgResponse: 'Avg response',
      turnaround: 'Turnaround',
      waiting: 'Waiting',
      response: 'Response',
      empty: 'No metrics yet',
    },
    queues: {
      incoming: 'Incoming',
      ready: 'Ready',
      waiting: 'Waiting',
      terminated: 'Terminated',
      noIncoming: 'No incoming processes',
      emptyQueue: 'Queue is empty',
      noWaiting: 'No waiting processes',
      noTerminated: 'No terminated processes',
    },
    core: { title: (mode) => `Processor core | ${mode}`, active: 'Active', idle: 'Core idle' },
    item: {
      priority: (value) => `Priority ${value}`,
      waiting: (value) => `Waiting ${value}`,
      arrival: 'Arr',
      start: 'Start',
      end: 'End',
      cpu: 'CPU cycle execution',
      nextTask: 'Next task',
      blockedTasks: (count) => `Blocked tasks (${count})`,
      task: (index) => `Task #${index}`,
    },
    chart: {
      empty: 'No timeline data yet. Start the process simulation to see the chart.',
      title: 'Realtime process scheduling',
      time: 'Time (units)',
      status: 'Status',
      running: 'Running',
      blocked: 'I/O blocked',
    },
  },
  vi: {
    meta: {
      title: 'Bộ lập lịch tiến trình',
      description: 'Mô phỏng cách hệ điều hành lập lịch các tiến trình trên nhiều nhân CPU.',
    },
    schedulers: {
      [SchedulerModeType.FIFO]: 'Vào trước, ra trước (FIFO)',
      [SchedulerModeType.SJF]: 'Việc ngắn nhất trước (SJF)',
      [SchedulerModeType.ROUND_ROBIN]: 'Xoay vòng (Round Robin)',
      [SchedulerModeType.MLFQ]: 'Hàng đợi phản hồi đa mức (MLFQ)',
    },
    processStatus: {
      [ProcessStatusType.NEW]: 'mới',
      [ProcessStatusType.READY]: 'sẵn sàng',
      [ProcessStatusType.RUNNING]: 'đang chạy',
      [ProcessStatusType.WAITING]: 'đang chờ',
      [ProcessStatusType.TERMINATED]: 'đã kết thúc',
    },
    storeStatus: {
      initial: 'khởi tạo',
      ready: 'sẵn sàng',
      running: 'đang chạy',
      pause: 'tạm dừng',
      ended: 'đã xong',
    },
    statusBadge: (status) => `Trạng thái: ${status}`,
    run: 'Chạy',
    rerun: 'Chạy lại',
    pause: 'Tạm dừng',
    columnView: 'Dạng cột',
    chartView: 'Dạng biểu đồ',
    empty: 'Chưa có tiến trình nào.',
    import: 'Nhập dữ liệu',
    export: 'Xuất dữ liệu',
    reset: 'Đặt lại',
    data: {
      trigger: 'Dữ liệu',
      title: 'Cập nhật tiến trình',
      processes: 'Tiến trình',
      addProcess: '+ Thêm tiến trình',
      clearAll: 'Xoá tất cả',
      saveChanges: 'Lưu thay đổi',
      arrivalTime: 'Thời điểm đến',
      executionTime: 'Thời gian chạy',
      addBlockTask: '+ Thêm tác vụ chặn',
      start: 'Bắt đầu',
      duration: 'Thời lượng',
      deleteProcess: 'Xoá tiến trình',
      deleteBlockTask: 'Xoá tác vụ chặn',
      errors: {
        arrivalMin: 'Thời điểm đến phải từ 0 trở lên',
        executionMin: 'Thời gian chạy phải từ 1 trở lên',
        executionMax: 'Thời gian chạy tối đa là 120',
      },
    },
    importDialog: {
      title: 'Cấu hình dữ liệu',
      upload: 'Tải lên tệp cấu hình',
      alternative: 'Hoặc',
      quickStart: 'Bắt đầu nhanh',
      loadExample: 'Dùng dữ liệu mẫu',
      loadExampleHint: 'Bắt đầu ngay với các tiến trình có sẵn',
      template: 'Mẫu JSON',
      invalidJson: 'Tệp JSON không hợp lệ',
    },
    settings: {
      open: 'Mở cài đặt tiến trình',
      title: 'Cài đặt tiến trình',
      scheduler: 'Thuật toán lập lịch',
      maxBlockTasks: 'Số tác vụ chặn tối đa mỗi lát thời gian',
      displayMode: 'Chế độ hiển thị',
      displayModes: { chart: 'Biểu đồ', column: 'Cột' },
    },
    metrics: {
      trigger: 'Chỉ số',
      title: 'Chỉ số',
      avgTurnaround: 'TB hoàn thành',
      avgWaiting: 'TB chờ',
      avgResponse: 'TB phản hồi',
      turnaround: 'Hoàn thành',
      waiting: 'Chờ',
      response: 'Phản hồi',
      empty: 'Chưa có số liệu',
    },
    queues: {
      incoming: 'Sắp đến',
      ready: 'Sẵn sàng',
      waiting: 'Đang chờ',
      terminated: 'Đã kết thúc',
      noIncoming: 'Không có tiến trình sắp đến',
      emptyQueue: 'Hàng đợi trống',
      noWaiting: 'Không có tiến trình đang chờ',
      noTerminated: 'Chưa có tiến trình kết thúc',
    },
    core: { title: (mode) => `Nhân xử lý | ${mode}`, active: 'Đang hoạt động', idle: 'Nhân rảnh' },
    item: {
      priority: (value) => `Ưu tiên ${value}`,
      waiting: (value) => `Chờ ${value}`,
      arrival: 'Đến',
      start: 'Bắt đầu',
      end: 'Kết thúc',
      cpu: 'Thời gian CPU',
      nextTask: 'Tác vụ tiếp theo',
      blockedTasks: (count) => `Tác vụ chặn (${count})`,
      task: (index) => `Tác vụ #${index}`,
    },
    chart: {
      empty: 'Chưa có dữ liệu. Hãy chạy mô phỏng để xem biểu đồ.',
      title: 'Lập lịch tiến trình theo thời gian thực',
      time: 'Thời gian (đơn vị)',
      status: 'Trạng thái',
      running: 'Đang chạy',
      blocked: 'Chặn I/O',
    },
  },
});
