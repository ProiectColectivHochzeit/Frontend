import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

console.log('🚀 main.ts: Starting Angular bootstrap...');

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('✅ SUCCESS: Angular app bootstrapped!');
  })
  .catch((err) => {
    console.error('❌ ERROR bootstrapping Angular:', err);
    document.body.innerHTML = `
      <div style="padding: 50px; background: #ffebee; border: 2px solid #c62828; color: #c62828;">
        <h1>Angular Bootstrap Error</h1>
        <p><strong>Error:</strong> ${err.message || 'Unknown error'}</p>
        <pre style="background: white; padding: 20px; overflow: auto;">${err.stack || err}</pre>
      </div>
    `;
  });
