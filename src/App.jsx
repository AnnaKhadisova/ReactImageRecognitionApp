import React, { Component } from 'react';
import ParticlesBg from 'particles-bg'
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import './App.css'


class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }


  calculateFaceLocation = (data) => {
    const clarifaiFace = data
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({ box: box })
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value }); //
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });

    fetch('http://localhost:5000/clarifai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl: this.state.input })
    })
      .then(response => response.json())
      .then(result => this.displayFaceBox(this.calculateFaceLocation(result.outputs[0].data.regions[0].region_info.bounding_box)));
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({ isSignedIn: false })
    } else if (route === 'home') {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route: route });
  }

  render() {
    return (
      <>
        <div className="App">
          <ParticlesBg type="circle" bg={true} />
          <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
          {this.state.route === 'home'
            ? <div> <Logo />
              <Rank name={this.state.user.name}
                entries={this.state.user.entries} />
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
              <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />  </div>

            : (this.state.route === 'signin'
              ? <Signin onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            )
          }
        </div>
      </>
    )
  }
}

export default App
