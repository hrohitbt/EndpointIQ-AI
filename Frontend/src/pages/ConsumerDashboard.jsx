function ConsumerDashboard() {
  return (
    <div className="min-h-screen bg-slate-100">

      <div className="max-w-7xl mx-auto p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Consumer
            </h1>

            <p className="text-slate-500 mt-1">
              Endpoint experience and device health
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Last updated: Just now
          </div>

        </div>


        {/* Dashboard Tabs */}
        <div className="flex gap-8 border-b border-slate-200 mb-8">

          <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-semibold">
            Overview
          </button>

          <button className="pb-3 text-slate-500 hover:text-slate-900">
            Experience
          </button>

          <button className="pb-3 text-slate-500 hover:text-slate-900">
            Performance
          </button>

          <button className="pb-3 text-slate-500 hover:text-slate-900">
            Connectivity
          </button>

        </div>


        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* DEX Score */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <p className="text-sm text-slate-500">
              DEX Score
            </p>

            <div className="flex items-end gap-2 mt-3">

              <h2 className="text-4xl font-bold text-slate-900">
                87
              </h2>

              <span className="text-sm text-green-600 mb-1">
                Good
              </span>

            </div>

            <p className="text-sm text-slate-400 mt-2">
              Overall digital experience
            </p>

          </div>


          {/* My Devices */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <p className="text-sm text-slate-500">
              My Devices
            </p>

            <h2 className="text-4xl font-bold text-slate-900 mt-3">
              12
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              Managed endpoints
            </p>

          </div>


          {/* Healthy Devices */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <p className="text-sm text-slate-500">
              Healthy Devices
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-3">
              9
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              75% of devices
            </p>

          </div>


          {/* Attention Required */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <p className="text-sm text-slate-500">
              Attention Required
            </p>

            <h2 className="text-4xl font-bold text-orange-500 mt-3">
              3
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              Devices need attention
            </p>

          </div>

        </div>


        {/* ================================================== */}
        {/* Endpoint Experience */}
        {/* ================================================== */}

        <div className="mt-8">

          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Endpoint Experience
          </h2>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Endpoint Health */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

              <h3 className="text-lg font-semibold">
                Endpoint Health
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                Overall device experience
              </p>


              <div className="flex items-center justify-center h-56">

                <div className="text-center">

                  <div className="text-6xl font-bold text-blue-600">
                    87
                  </div>

                  <div className="text-slate-400">
                    / 100
                  </div>

                </div>

              </div>

            </div>


            {/* Boot Experience */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

              <h3 className="text-lg font-semibold">
                Boot Experience
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                Endpoint boot performance
              </p>


              <div className="mt-8">

                <div className="flex justify-between mb-2">

                  <span className="text-slate-500">
                    Boot Score
                  </span>

                  <span className="font-semibold">
                    82
                  </span>

                </div>


                <div className="w-full bg-slate-200 rounded-full h-3">

                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: "82%" }}
                  />

                </div>

              </div>


              <div className="mt-8 text-sm text-slate-500">
                2 devices have slow boot performance.
              </div>

            </div>

          </div>

        </div>


        {/* ================================================== */}
        {/* Device Health */}
        {/* ================================================== */}

        <div className="mt-10">

          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Device Health
          </h2>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Memory Issues */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

              <p className="text-sm text-slate-500">
                Memory Issues
              </p>

              <h2 className="text-4xl font-bold text-orange-500 mt-3">
                2
              </h2>

              <p className="text-sm text-slate-400 mt-2">
                Devices with high memory usage
              </p>

            </div>


            {/* Not Rebooted */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

              <p className="text-sm text-slate-500">
                Not Rebooted
              </p>

              <h2 className="text-4xl font-bold text-orange-500 mt-3">
                3
              </h2>

              <p className="text-sm text-slate-400 mt-2">
                Devices over 7 days
              </p>

            </div>


            {/* Slow Logon */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

              <p className="text-sm text-slate-500">
                Slow Logon
              </p>

              <h2 className="text-4xl font-bold text-red-500 mt-3">
                2
              </h2>

              <p className="text-sm text-slate-400 mt-2">
                Devices above 60 seconds
              </p>

            </div>


            {/* Application Crashes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

              <p className="text-sm text-slate-500">
                Application Crashes
              </p>

              <h2 className="text-4xl font-bold text-red-500 mt-3">
                4
              </h2>

              <p className="text-sm text-slate-400 mt-2">
                Devices affected
              </p>

            </div>

          </div>

        </div>


        {/* ================================================== */}
        {/* Connectivity */}
        {/* ================================================== */}

        <div className="mt-10">

          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Connectivity
          </h2>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Wi-Fi Experience */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

              <h3 className="text-lg font-semibold">
                Wi-Fi Experience
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                Endpoint wireless experience
              </p>


              <div className="mt-8">

                <div className="flex justify-between mb-2">

                  <span className="text-slate-500">
                    Good Wi-Fi Experience
                  </span>

                  <span className="font-semibold">
                    75%
                  </span>

                </div>


                <div className="w-full bg-slate-200 rounded-full h-3">

                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: "75%" }}
                  />

                </div>

              </div>


              <div className="grid grid-cols-2 gap-4 mt-8">

                <div className="bg-green-50 rounded-xl p-4">

                  <p className="text-sm text-slate-500">
                    Good
                  </p>

                  <p className="text-2xl font-bold text-green-600 mt-1">
                    9
                  </p>

                </div>


                <div className="bg-red-50 rounded-xl p-4">

                  <p className="text-sm text-slate-500">
                    Poor
                  </p>

                  <p className="text-2xl font-bold text-red-500 mt-1">
                    3
                  </p>

                </div>

              </div>

            </div>


            {/* Connectivity Issues */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

              <h3 className="text-lg font-semibold">
                Connectivity Issues
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                Devices experiencing network problems
              </p>


              <div className="flex items-center justify-center h-56">

                <div className="text-center">

                  <div className="text-6xl font-bold text-orange-500">
                    3
                  </div>

                  <p className="text-slate-500 mt-2">
                    Devices require attention
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================== */}
        {/* Application Experience */}
        {/* ================================================== */}

        <div className="mt-10">

          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Application Experience
          </h2>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Application Crashes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

              <h3 className="text-lg font-semibold">
                Application Crashes
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                Applications affecting endpoint experience
              </p>


              <div className="mt-8">

                <div className="flex items-center justify-between border-b border-slate-100 py-4">

                  <span className="text-slate-700">
                    Microsoft Teams
                  </span>

                  <span className="font-semibold text-red-500">
                    3 crashes
                  </span>

                </div>


                <div className="flex items-center justify-between border-b border-slate-100 py-4">

                  <span className="text-slate-700">
                    Outlook
                  </span>

                  <span className="font-semibold text-orange-500">
                    2 crashes
                  </span>

                </div>


                <div className="flex items-center justify-between py-4">

                  <span className="text-slate-700">
                    Edge
                  </span>

                  <span className="font-semibold text-yellow-600">
                    1 crash
                  </span>

                </div>

              </div>

            </div>


            {/* Logon Experience */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

              <h3 className="text-lg font-semibold">
                Logon Experience
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                Windows user logon performance
              </p>


              <div className="mt-8 space-y-5">

                <div>

                  <div className="flex justify-between mb-2">

                    <span className="text-slate-500">
                      Good
                    </span>

                    <span className="font-semibold">
                      8 devices
                    </span>

                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2">

                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "67%" }}
                    />

                  </div>

                </div>


                <div>

                  <div className="flex justify-between mb-2">

                    <span className="text-slate-500">
                      Average
                    </span>

                    <span className="font-semibold">
                      2 devices
                    </span>

                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2">

                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: "17%" }}
                    />

                  </div>

                </div>


                <div>

                  <div className="flex justify-between mb-2">

                    <span className="text-slate-500">
                      Frustrating
                    </span>

                    <span className="font-semibold">
                      2 devices
                    </span>

                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2">

                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: "17%" }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================== */}
        {/* AI Insights */}
        {/* ================================================== */}

        <div className="mt-10 mb-10">

          <h2 className="text-xl font-bold text-slate-900 mb-4">
            EndpointIQ AI Insights
          </h2>


          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <div className="flex items-start gap-4">

              <div className="text-3xl">
                🤖
              </div>

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Endpoint recommendations
                </h3>

                <p className="text-slate-500 text-sm mt-1">
                  AI-powered insights based on endpoint experience data.
                </p>

              </div>

            </div>


            <div className="mt-6 space-y-3">

              <div className="bg-red-50 rounded-xl p-4">

                <p className="text-red-700 font-medium">
                  3 devices are experiencing connectivity issues.
                </p>

              </div>


              <div className="bg-yellow-50 rounded-xl p-4">

                <p className="text-yellow-700 font-medium">
                  2 devices have high memory utilization.
                </p>

              </div>


              <div className="bg-blue-50 rounded-xl p-4">

                <p className="text-blue-700 font-medium">
                  2 devices have slow logon performance.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ConsumerDashboard;