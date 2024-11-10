import Lottie from 'lottie-react';

const HeaderCards = ({ title, description, animationData }) => {
  return (
    <div className="bg-[#f0f8ff] p-6 rounded-lg shadow-xl border-t-4 border-[#09d1e3]"> {/* Background color and border color */}
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <Lottie
            animationData={animationData}
            loop={true}
            style={{ width: '200px', height: '200px' }}
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-[#09d1e3]">{title}</h1> {/* Title color */}
          <p className="text-[#333] text-lg">{description}</p> {/* Description text color */}
        </div>
      </div>
    </div>
  );
};

export default HeaderCards;
