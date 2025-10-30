export function initEastingNorthing() {
  const $eastingNorthingComponents = document.querySelectorAll(
    '.app-location-input.app-location-input--eastingnorthingfield'
  )

  // window.alert(
  //   `Found ${$eastingNorthingComponents.length} easting and northing components`
  // )

  $eastingNorthingComponents.forEach($component => {
    // Add geolocate buttton
    if (window.navigator.geolocation) {
      const $inputs = $component.querySelectorAll('.govuk-input')
      const $input1 = /** @type {HTMLInputElement} */($inputs[0])
      const $input2 = /** @type {HTMLInputElement} */($inputs[1])
      const $geolocateButton = document.createElement('button')
      $geolocateButton.textContent = 'Geolocate'
      $geolocateButton.classList.add('govuk-button')
      $geolocateButton.classList.add('govuk-button--secondary')
      $geolocateButton.classList.add('govuk-!-margin-bottom-0')
      $geolocateButton.style.verticalAlign = 'super'

      $geolocateButton.addEventListener(
        'click',
        function (e) {
          e.preventDefault()
          navigator.geolocation.getCurrentPosition((position) => {
              $input1.value = position.coords.latitude.toString()
              $input2.value = position.coords.longitude.toString()
            },
            () => {
              alert('Sorry, no position available.')
            }
          )
          return false
        },
        false
      )
      $component.appendChild($geolocateButton)

      const $map = document.createElement('div')
      $map.classList.add('govuk-!-margin-top-5')
      $map.classList.add('govuk-!-margin-bottom-5')
      $map.innerHTML = `<div class="mapouter"><div class="gmap_canvas"><iframe class="gmap_iframe" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=Birmingham uk&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"></iframe><a href="https://nicemail.cc">nicemail</a></div><style>.mapouter{position:relative;text-align:right;width:600px;height:400px;}.gmap_canvas {overflow:hidden;background:none!important;width:600px;height:400px;}.gmap_iframe {width:600px!important;height:400px!important;}</style></div>`
      $component.appendChild($map)
    }
  })
}
