import React from 'react';

const Home = () => {
  return (
    <div className="AdminHome w-[1440px] h-[1024px] relative bg-white">
      <div className="Rectangle21 w-[1042px] h-[1023px] left-[398px] top-0 absolute bg-white" />
      <div className="Rectangle25 w-[970px] h-[3px] left-[434px] top-[92px] absolute bg-[#1e1e1e]" />
      <div className="Rectangle30 w-[970px] h-[3px] left-[429px] top-[411px] absolute bg-[#1e1e1e]" />
      <div className="Home left-[863px] top-[40px] absolute text-[#09d1e3] text-[32px] font-extrabold font-['Nunito'] tracking-[7.68px]">
        Home
      </div>
      <div className="Statistics w-[242px] left-[434px] top-[127px] absolute text-[#0e1550] text-5xl font-semibold font-['Nunito'] tracking-[3.84px]">
        Statistics
      </div>
      <div className="Feedbacks w-[346px] left-[429px] top-[454px] absolute text-[#0e1550] text-5xl font-semibold font-['Nunito'] tracking-[3.84px]">
        Feedbacks
      </div>
      <div className="Announcements left-[429px] top-[757px] absolute text-[#0e1550] text-5xl font-semibold font-['Nunito'] tracking-[3.84px]">
        Announcements
      </div>

      {/* Feedback Section */}
      <div className="Frame129 h-[194px] p-4 left-[429px] top-[535px] absolute bg-[#e2e2e2] rounded-lg flex-col justify-start items-start gap-6 inline-flex">
        <div className="Frame83 justify-start items-center gap-4 inline-flex">
          <img className="Ellipse3 w-12 h-12 rounded-full" src="https://via.placeholder.com/48x48" alt="User Avatar" />
          <div className="SamGoodman text-black text-xl font-normal font-['Nunito']">Sam Goodman</div>
        </div>
        <div className="Frame127 self-stretch h-[90px] flex-col justify-start items-start gap-1 flex">
          <div className="Frame126 self-stretch h-[67px] flex-col justify-start items-start gap-1 flex">
            <div className="Unresponsive self-stretch text-[#6f1212] text-lg font-semibold font-['Nunito']">Unresponsive</div>
            <div className="ThereAreTimesThatTheMobileAppIsUnresponsivePleaseFixThisIssueIWould self-stretch text-black text-sm font-normal font-['Nunito']">
              There are times that the mobile app is unresponsive. Please fix this issue. I would...
            </div>
          </div>
          <div className="ReadMore self-stretch text-[#09d1e3] text-sm font-semibold font-['Nunito'] underline">
            Read more
          </div>
        </div>
      </div>

      {/* More Feedbacks */}
      <div className="Frame130 w-[329px] h-[194px] p-4 left-[786px] top-[535px] absolute bg-[#e2e2e2] rounded-lg flex-col justify-start items-start gap-6 inline-flex">
        <div className="Frame83 justify-start items-center gap-4 inline-flex">
          <img className="Ellipse3 w-12 h-12 rounded-full" src="https://via.placeholder.com/48x48" alt="User Avatar" />
          <div className="JohnSheltzman text-black text-xl font-normal font-['Nunito']">John Sheltzman</div>
        </div>
        <div className="Frame127 self-stretch h-[71px] flex-col justify-start items-start gap-1 flex">
          <div className="Frame126 self-stretch h-12 flex-col justify-start items-start gap-1 flex">
            <div className="GreatApp self-stretch text-[#247000] text-lg font-semibold font-['Nunito']">Great app</div>
            <div className="IVeBeenUsingThisAppForAboutAMonthNow self-stretch text-black text-sm font-normal font-['Nunito']">
              I’ve been using this app for about a month now.
            </div>
          </div>
          <div className="ReadMore self-stretch text-[#09d1e3] text-sm font-semibold font-['Nunito'] underline">
            Read more
          </div>
        </div>
      </div>

      <div className="Frame131 w-[329px] h-[194px] p-4 left-[1143px] top-[535px] absolute bg-[#e2e2e2] rounded-lg flex-col justify-start items-start gap-6 inline-flex">
        <div className="Frame83 justify-start items-center gap-4 inline-flex">
          <img className="Ellipse3 w-12 h-12 rounded-full" src="https://via.placeholder.com/48x48" alt="User Avatar" />
          <div className="MaryvilSummers text-black text-xl font-normal font-['Nunito']">Maryvil Summers</div>
        </div>
        <div className="Frame127 self-stretch h-[71px] flex-col justify-start items-start gap-1 flex">
          <div className="Frame126 self-stretch h-12 flex-col justify-start items-start gap-1 flex">
            <div className="Superb self-stretch text-[#247000] text-lg font-semibold font-['Nunito']">Superb!!</div>
            <div className="HelpsMeWithMyDayToDayCommute self-stretch text-black text-sm font-normal font-['Nunito']">
              Helps me with my day-to-day commute
            </div>
          </div>
          <div className="ReadMore self-stretch text-[#09d1e3] text-sm font-semibold font-['Nunito'] underline">
            Read more
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="Rectangle20 w-[400px] h-[1024px] left-[-2px] top-[-1px] absolute bg-gradient-to-b from-[#0e1550] to-[#1f2fb6]" />
      <div className="Frame114 w-[352px] p-2.5 left-[22px] top-[930px] absolute bg-[#6f1212] rounded-lg justify-center items-center gap-2.5 inline-flex">
        <div className="Logout text-white text-2xl font-normal font-['Nunito']">Logout</div>
      </div>

      <div className="Group38 w-[360px] h-[260px] left-[18px] top-[39px] absolute">
        <div className="Admin w-[79px] h-[27.41px] left-[145px] top-[186.90px] absolute text-white text-2xl font-normal font-['Nunito'] tracking-widest">
          Admin
        </div>
        <img className="SmartCity12 w-[360px] h-[260px] left-0 top-0 absolute" src="https://via.placeholder.com/360x260" alt="Admin Logo" />
      </div>

      {/* Sidebar Menu */}
      <div className="Frame353 h-[316px] left-[50px] top-[331px] absolute flex-col justify-start items-start gap-[29px] inline-flex">
        <div className="Frame117 justify-start items-center gap-4 inline-flex">
          <img className="HomePage w-10 h-10" src="https://via.placeholder.com/40x40" alt="Home Icon" />
          <div className="Home text-white text-2xl font-normal font-['Nunito'] tracking-widest">Home</div>
        </div>
        <div className="Frame115 justify-start items-center gap-4 inline-flex">
          <img className="Customer w-10 h-10" src="https://via.placeholder.com/40x40" alt="Customer Icon" />
          <div className="AdminProfile text-white text-2xl font-normal font-['Nunito'] tracking-widest">Admin Profile</div>
        </div>
        <div className="Frame116 self-stretch justify-start items-center gap-4 inline-flex">
          <img className="Users w-10 h-10" src="https://via.placeholder.com/40x40" alt="Users Icon" />
          <div className="UserManagement text-white text-2xl font-normal font-['Nunito'] tracking-widest">User Management</div>
        </div>
        <div className="Frame118 justify-start items-center gap-4 inline-flex">
          <img className="Comments w-10 h-10" src="https://via.placeholder.com/40x40" alt="Comments Icon" />
          <div className="Feedbacks text-white text-2xl font-normal font-['Nunito'] tracking-widest">Feedbacks</div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="Frame128 w-[889px] h-[216px] left-[428px] top-[208px] absolute flex justify-around gap-6">
        <div className="Frame82 w-[217px] h-[196px] p-5 bg-[#e2e2e2] rounded-lg flex flex-col justify-start items-center gap-2">
          <div className="TotalUsers text-[#247000] text-3xl font-semibold font-['Nunito']">Total Users</div>
          <div className="UsersCount text-black text-6xl font-semibold font-['Nunito']">125</div>
        </div>
        <div className="Frame81 w-[217px] h-[196px] p-5 bg-[#e2e2e2] rounded-lg flex flex-col justify-start items-center gap-2">
          <div className="PremiumUsers text-[#0e1550] text-3xl font-semibold font-['Nunito']">Premium Users</div>
          <div className="PremiumCount text-black text-6xl font-semibold font-['Nunito']">50</div>
        </div>
        <div className="Frame80 w-[217px] h-[196px] p-5 bg-[#e2e2e2] rounded-lg flex flex-col justify-start items-center gap-2">
          <div className="FreeUsers text-[#6f1212] text-3xl font-semibold font-['Nunito']">Free Users</div>
          <div className="FreeCount text-black text-6xl font-semibold font-['Nunito']">75</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
