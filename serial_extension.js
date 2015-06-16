(function(ext) {

        var device = null;
        var potentialDevices = [];
        var recvDataQueue = [];
        var recvHandlerQueue = [];
        ext._deviceConnected = function(dev) {
         potentialDevices.push(dev);
         if(!device){
            tryNextDevice();
         }
        };

        function recvQueuePoll(){
           var nextData = recvDataQueue.shift();
           var nextHandler = recvHandlerQueue.shift();
           if(nextData && !nextHandler){
                 recvDataQueue.unshift(data);
           }
           else if(nextHandler && !nextData){
               recvHandlerQueue.unshift(nextHandler);
           }
           else{
            nextHandler(nextData);
           }
        };

        function tryNextDevice() {
         nextDevice = potentialDevices.shift();
         if (!device)
            return;
         device.open({ stopBits: 1, bitRate: 9600});
         device.set_receive_handler(function(data) {
           recvDataQueue.push(data);
           recvQueuePoll();
         });
        };

   ext._shutdown = function() {
      if (device) device.close();
      device = null;
   };

   ext._deviceRemoved = function(dev) {
      if(dev == device){
         device = null;     
      }
   };

   ext._getStatus = function() {
      if(!device) return {status: 1, msg: 'Device not connected'};
          return {status: 2, msg: 'Device connected'};
   };

   ext.sendall = function(raw_byte){
      if(0 <= raw_bye && raw_byte <= 255){
         if(device){
            device.send(UInt8Array.of(raw_byte).buffer)
            return true;
         }
      }
      return false;
   };

   ext.recv = function(callback){
      recvHandlerQueue.push(callback);
      recvQueuePoll();
   };

   var descriptor = {
           blocks: [
                   ['r', 'send byte: %n', 'sendall', 0x00],
                   ['R', 'recv byte', 'recv']
                   ],

           url: 'https://github.com/bsb20/scratch-to-serial/tree/gh-pages'
   };

   // Register the extension
   ScratchExtensions.register('Sample extension', descriptor, ext, {type: 'serial'});
})({});



