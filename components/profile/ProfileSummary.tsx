
export default function ProfileSummary(){
 return (
 <div className='max-w-5xl mx-auto p-8'>
  <h1 className='text-4xl font-bold mb-6'>Child Compass Profile™</h1>
  <div className='grid md:grid-cols-2 gap-6'>
   <div className='rounded-3xl bg-white p-6 shadow'>Me In A Nutshell</div>
   <div className='rounded-3xl bg-white p-6 shadow'>Communication Style</div>
   <div className='rounded-3xl bg-white p-6 shadow'>Triggers</div>
   <div className='rounded-3xl bg-white p-6 shadow'>Regulators</div>
   <div className='rounded-3xl bg-white p-6 shadow'>What Helps Me Feel Safe</div>
   <div className='rounded-3xl bg-white p-6 shadow'>How To Support Me</div>
  </div>
 </div>
 );
}
