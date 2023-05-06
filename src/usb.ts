export async function requestNrealAccess() {
  const devices = await navigator.hid.requestDevice({
    filters: [{ vendorId: 0x3318, productId: 0x0424 }],
  });

  // When access is granted, there are 3 devices.
  // One of the device will report the sensor data.
  // However these devices are in an arbitrary order.
  // So we throw the HID message at all devices and see what sticks.
  // Improvement contributions are welcome.
  devices.forEach((d, i) => {
    d.oninputreport = (e) => {
      reportHandler(i, new Uint8Array(e.data.buffer));
    };
    d.open().then(async () => {
      console.log(i, "open");

      // Ask it to send report.
      // https://github.com/MSmithDev/AirAPI_Windows/blob/7afe491f4d724f451e242fe324751ba79cca4f9e/AirAPI_Windows.cpp#L423
      await d.sendReport(
        0,
        new Uint8Array([0xaa, 0xc5, 0xd1, 0x21, 0x42, 0x04, 0x00, 0x19, 0x01])
      );
    });
  });
}

export type ReportHandler = (deviceIndex: number, data: Uint8Array) => void;

let reportHandler: ReportHandler = () => {
  // stub
};

export function setReportHandler(handler: ReportHandler) {
  reportHandler = handler;
}
