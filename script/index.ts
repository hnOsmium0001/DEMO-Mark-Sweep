import '../css/index.css';
import '../css/unit.css';
 
import { Bindings } from './ui_behavior';
import { MemoryDisplay } from './ui_memory_display';
import $ from 'jquery';

$(document).ready(() => {
  const memoryDisplay = new MemoryDisplay(parseInt($('#heap-size').val() as string));

  new Bindings(memoryDisplay).bindAll();
});
