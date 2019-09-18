import React from "react";
import { Text, TouchableWithoutFeedback, View } from "react-native";

interface IProps {
  back: () => void;
}

interface IState {
  touchCount: number;
}

export class MoreExamples extends React.Component<IProps, IState> {
  state = {
    touchCount: 0,
  };

  render() {
    const { touchCount } = this.state;

    return (
      <View>
        <Text accessibilityRole="link" onPress={this.props.back}>
          Back
        </Text>
        <TouchableWithoutFeedback
          onPress={() => {
            this.setState({
              touchCount: this.state.touchCount + 1,
            });
          }}
        >
          <Text style={{ padding: 30 }}>Touch here to add count: {touchCount}</Text>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}
