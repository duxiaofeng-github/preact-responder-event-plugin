import React from "react";
import { View, StyleSheet, Text, Switch, GestureResponderEvent, Platform } from "react-native";

interface IProps {}

interface IState {
  parentStateText: string[];
  childOneStateText: string[];
  childTwoStateText: string[];
  useCapture: boolean;
  allowTerminationRequest: boolean;
  childOneShouldResponse: boolean;
  childTwoShouldResponse: boolean;
  parentShouldResponse: boolean;
  isParentResponding: boolean;
  isChildOneResponding: boolean;
  isChildTwoResponding: boolean;
}

enum NodeType {
  Parent = "parent",
  ChildOne = "child1",
  ChildTwo = "child2",
}

export class Container extends React.Component<IProps, IState> {
  state = {
    parentStateText: ["No event"],
    childOneStateText: ["No event"],
    childTwoStateText: ["No event"],
    useCapture: false,
    allowTerminationRequest: false,
    childOneShouldResponse: false,
    childTwoShouldResponse: false,
    parentShouldResponse: false,
    isParentResponding: false,
    isChildOneResponding: false,
    isChildTwoResponding: false,
  };

  render() {
    const {
      useCapture,
      allowTerminationRequest,
      childOneShouldResponse,
      childTwoShouldResponse,
      parentShouldResponse,
      childOneStateText,
      childTwoStateText,
      parentStateText,
      isParentResponding,
      isChildOneResponding,
      isChildTwoResponding,
    } = this.state;

    return (
      <View style={[style.container, { userSelect: "none" } as any]}>
        <View style={style.title}>
          <View
            onStartShouldSetResponder={() => true}
            onResponderStart={() => {
              if (Platform.OS === "web")
                location.href = "https://github.com/duxiaofeng-github/preact-responder-event-plugin";
            }}
          >
            <Text accessibilityRole="link" style={style.titleText}>
              Preact Responder Event Plugin Demo
            </Text>
          </View>
        </View>
        <View style={style.content}>
          <View
            style={[style.parent, isParentResponding && { borderColor: "red" }]}
            onStartShouldSetResponder={(e: GestureResponderEvent) => this.handleShouldSetResponder(NodeType.Parent, e)}
            onStartShouldSetResponderCapture={
              useCapture
                ? (e: GestureResponderEvent) => this.handleShouldSetResponderCapture(NodeType.Parent, e)
                : undefined
            }
            onResponderStart={(e: GestureResponderEvent) => this.handleResponderStarted(NodeType.Parent, e)}
            onMoveShouldSetResponder={(e: GestureResponderEvent) => this.handleShouldSetResponder(NodeType.Parent, e)}
            onMoveShouldSetResponderCapture={
              useCapture
                ? (e: GestureResponderEvent) => this.handleShouldSetResponderCapture(NodeType.Parent, e)
                : undefined
            }
            onResponderMove={(e: GestureResponderEvent) => this.handleResponderMoved(NodeType.Parent, e)}
            onResponderTerminationRequest={(e: GestureResponderEvent) =>
              this.handleResponderTerminationRequest(NodeType.Parent, e)
            }
            onResponderTerminate={(e: GestureResponderEvent) => this.handleResponderTerminated(NodeType.Parent, e)}
            onResponderGrant={(e: GestureResponderEvent) => this.handleResponderGranted(NodeType.Parent, e)}
            onResponderReject={(e: GestureResponderEvent) => this.handleResponderRejected(NodeType.Parent, e)}
            onResponderEnd={(e: GestureResponderEvent) => this.handleResponderEnded(NodeType.Parent, e)}
            onResponderRelease={(e: GestureResponderEvent) => this.handleResponderReleased(NodeType.Parent, e)}
          >
            <View
              style={[style.child, isChildOneResponding && { borderColor: "red" }]}
              onStartShouldSetResponder={(e: GestureResponderEvent) =>
                this.handleShouldSetResponder(NodeType.ChildOne, e)
              }
              onStartShouldSetResponderCapture={
                useCapture
                  ? (e: GestureResponderEvent) => this.handleShouldSetResponderCapture(NodeType.ChildOne, e)
                  : undefined
              }
              onResponderStart={(e: GestureResponderEvent) => this.handleResponderStarted(NodeType.ChildOne, e)}
              onMoveShouldSetResponder={(e: GestureResponderEvent) =>
                this.handleShouldSetResponder(NodeType.ChildOne, e)
              }
              onMoveShouldSetResponderCapture={
                useCapture
                  ? (e: GestureResponderEvent) => this.handleShouldSetResponderCapture(NodeType.ChildOne, e)
                  : undefined
              }
              onResponderMove={(e: GestureResponderEvent) => this.handleResponderMoved(NodeType.ChildOne, e)}
              onResponderTerminationRequest={(e: GestureResponderEvent) =>
                this.handleResponderTerminationRequest(NodeType.ChildOne, e)
              }
              onResponderTerminate={(e: GestureResponderEvent) => this.handleResponderTerminated(NodeType.ChildOne, e)}
              onResponderGrant={(e: GestureResponderEvent) => this.handleResponderGranted(NodeType.ChildOne, e)}
              onResponderReject={(e: GestureResponderEvent) => this.handleResponderRejected(NodeType.ChildOne, e)}
              onResponderEnd={(e: GestureResponderEvent) => this.handleResponderEnded(NodeType.ChildOne, e)}
              onResponderRelease={(e: GestureResponderEvent) => this.handleResponderReleased(NodeType.ChildOne, e)}
            >
              <View pointerEvents="none">
                <Text style={style.stateText}>Child 1 State:</Text>
                {this.getStateLogs(childOneStateText)}
              </View>
            </View>
            <View
              style={[style.child, isChildTwoResponding && { borderColor: "red" }]}
              onStartShouldSetResponder={(e: GestureResponderEvent) =>
                this.handleShouldSetResponder(NodeType.ChildTwo, e)
              }
              onStartShouldSetResponderCapture={
                useCapture
                  ? (e: GestureResponderEvent) => this.handleShouldSetResponderCapture(NodeType.ChildTwo, e)
                  : undefined
              }
              onResponderStart={(e: GestureResponderEvent) => this.handleResponderStarted(NodeType.ChildTwo, e)}
              onMoveShouldSetResponder={(e: GestureResponderEvent) =>
                this.handleShouldSetResponder(NodeType.ChildTwo, e)
              }
              onMoveShouldSetResponderCapture={
                useCapture
                  ? (e: GestureResponderEvent) => this.handleShouldSetResponderCapture(NodeType.ChildTwo, e)
                  : undefined
              }
              onResponderMove={(e: GestureResponderEvent) => this.handleResponderMoved(NodeType.ChildTwo, e)}
              onResponderTerminationRequest={(e: GestureResponderEvent) =>
                this.handleResponderTerminationRequest(NodeType.ChildTwo, e)
              }
              onResponderTerminate={(e: GestureResponderEvent) => this.handleResponderTerminated(NodeType.ChildTwo, e)}
              onResponderGrant={(e: GestureResponderEvent) => this.handleResponderGranted(NodeType.ChildTwo, e)}
              onResponderReject={(e: GestureResponderEvent) => this.handleResponderRejected(NodeType.ChildTwo, e)}
              onResponderEnd={(e: GestureResponderEvent) => this.handleResponderEnded(NodeType.ChildTwo, e)}
              onResponderRelease={(e: GestureResponderEvent) => this.handleResponderReleased(NodeType.ChildTwo, e)}
            >
              <View pointerEvents="none">
                <Text style={style.stateText}>Child 2 State:</Text>
                {this.getStateLogs(childTwoStateText)}
              </View>
            </View>
            <View style={style.parentStateTextContainer} pointerEvents="none">
              <Text style={style.stateText}>Parent State:</Text>
              {this.getStateLogs(parentStateText)}
            </View>
          </View>
          <View style={style.controls}>
            {this.renderSwitch(useCapture, this.handleUseCaptureChanged, "Use Capture")}
            {this.renderSwitch(
              allowTerminationRequest,
              this.handleAllowTerminationRequestChanged,
              "Allow Termination Request"
            )}
            {this.renderSwitch(
              childOneShouldResponse,
              this.handleChildOneShouldResponseChanged,
              "Child One Should Response"
            )}
            {this.renderSwitch(
              childTwoShouldResponse,
              this.handleChildTwoShouldResponseChanged,
              "Child Two Should Response"
            )}
            {this.renderSwitch(parentShouldResponse, this.handleParentShouldResponseChanged, "Parent Should Response")}
            <Text
              style={style.clearButton}
              accessibilityRole="link"
              onPress={() => {
                this.setState({
                  parentStateText: ["No event"],
                  childOneStateText: ["No event"],
                  childTwoStateText: ["No event"],
                });
              }}
            >
              Clear all logs
            </Text>
          </View>
        </View>
      </View>
    );
  }

  renderSwitch(value: boolean, changeHandler: (value: boolean) => void, text: string) {
    return (
      <View style={style.switch}>
        <Switch value={value} onValueChange={changeHandler}></Switch>
        <Text style={{ paddingLeft: 10 }}>{text}</Text>
      </View>
    );
  }

  getStateLogs(logs: string[]) {
    return logs.map((log) => {
      return <Text style={style.stateText}>{log}</Text>;
    });
  }

  handleUseCaptureChanged = (useCapture: boolean) => {
    this.setState({
      useCapture,
    });
  };

  handleAllowTerminationRequestChanged = (allowTerminationRequest: boolean) => {
    this.setState({
      allowTerminationRequest,
    });
  };

  handleChildOneShouldResponseChanged = (childOneShouldResponse: boolean) => {
    this.setState({
      childOneShouldResponse,
    });
  };

  handleChildTwoShouldResponseChanged = (childTwoShouldResponse: boolean) => {
    this.setState({
      childTwoShouldResponse,
    });
  };

  handleParentShouldResponseChanged = (parentShouldResponse: boolean) => {
    this.setState({
      parentShouldResponse,
    });
  };

  getNewStateText(state: string[], text: string, e: GestureResponderEvent) {
    return [...state, `[${(e as any).sn}] ${text}`];
  }

  increaseNumber(e: GestureResponderEvent) {
    (e as any).sn = (e as any).sn + 1 || 1;
  }

  handleShouldSetResponder = (type: NodeType, e: GestureResponderEvent) => {
    this.increaseNumber(e);

    const { childOneShouldResponse, childTwoShouldResponse, parentShouldResponse } = this.state;

    if (type === NodeType.Parent) {
      const newState = parentShouldResponse
        ? `parent wants to response ${e.type}`
        : `parent doesn't want to response ${e.type}`;

      this.setState((state) => {
        const parentStateText = this.getNewStateText(state.parentStateText, newState, e);

        return {
          parentStateText,
        };
      });

      return parentShouldResponse;
    } else if (type === NodeType.ChildOne) {
      const newState = childOneShouldResponse
        ? `child one wants to response ${e.type}`
        : `child one doesn't want to response ${e.type}`;

      this.setState((state) => {
        const childOneStateText = this.getNewStateText(state.childOneStateText, newState, e);

        return { childOneStateText };
      });

      return childOneShouldResponse;
    } else if (type === NodeType.ChildTwo) {
      const newState = childTwoShouldResponse
        ? `child two wants to response ${e.type}`
        : `child two doesn't want to response ${e.type}`;

      this.setState((state) => {
        const childTwoStateText = this.getNewStateText(state.childTwoStateText, newState, e);

        return { childTwoStateText };
      });

      return childTwoShouldResponse;
    }

    return false;
  };

  handleShouldSetResponderCapture = (type: NodeType, e: GestureResponderEvent) => {
    this.increaseNumber(e);

    const { childOneShouldResponse, childTwoShouldResponse, parentShouldResponse } = this.state;

    if (type === NodeType.Parent) {
      const newState = parentShouldResponse
        ? `parent wants to response ${e.type} during capture`
        : `parent doesn't want to response ${e.type} during capture`;

      this.setState((state) => {
        const parentStateText = this.getNewStateText(state.parentStateText, newState, e);
        return { parentStateText };
      });

      return parentShouldResponse;
    } else if (type === NodeType.ChildOne) {
      const newState = childOneShouldResponse
        ? `child one wants to response ${e.type} during capture`
        : `child one doesn't want to response ${e.type} during capture`;

      this.setState((state) => {
        const childOneStateText = this.getNewStateText(state.childOneStateText, newState, e);
        return { childOneStateText };
      });

      return childOneShouldResponse;
    } else if (type === NodeType.ChildTwo) {
      const newState = childTwoShouldResponse
        ? `child two wants to response ${e.type} during capture`
        : `child two doesn't want to response ${e.type} during capture`;

      this.setState((state) => {
        const childTwoStateText = this.getNewStateText(state.childTwoStateText, newState, e);
        return { childTwoStateText };
      });

      return childTwoShouldResponse;
    }

    return false;
  };

  handleResponderTerminationRequest = (type: NodeType, e: GestureResponderEvent) => {
    this.increaseNumber(e);

    const { allowTerminationRequest } = this.state;

    if (type === NodeType.Parent) {
      const newState = allowTerminationRequest
        ? `parent allow the termination request`
        : `parent doesn't allow the termination request`;

      this.setState((state) => {
        const parentStateText = this.getNewStateText(state.parentStateText, newState, e);
        return { parentStateText };
      });
    } else if (type === NodeType.ChildOne) {
      const newState = allowTerminationRequest
        ? `child one allow the termination request`
        : `child one doesn't allow the termination request`;

      this.setState((state) => {
        const childOneStateText = this.getNewStateText(state.childOneStateText, newState, e);
        return { childOneStateText };
      });
    } else if (type === NodeType.ChildTwo) {
      const newState = allowTerminationRequest
        ? `child two allow the termination request`
        : `child two doesn't allow the termination request`;

      this.setState((state) => {
        const childTwoStateText = this.getNewStateText(state.childTwoStateText, newState, e);
        return { childTwoStateText };
      });
    }

    return allowTerminationRequest;
  };

  handleResponderTerminated(type: NodeType, e: GestureResponderEvent) {
    this.increaseNumber(e);

    if (type === NodeType.Parent) {
      const newState = `parent has been terminated`;

      this.setState((state) => {
        const parentStateText = this.getNewStateText(state.parentStateText, newState, e);
        return { parentStateText };
      });
    } else if (type === NodeType.ChildOne) {
      const newState = `child one has been terminated`;

      this.setState((state) => {
        const childOneStateText = this.getNewStateText(state.childOneStateText, newState, e);
        return { childOneStateText };
      });
    } else if (type === NodeType.ChildTwo) {
      const newState = `child two has been terminated`;

      this.setState((state) => {
        const childTwoStateText = this.getNewStateText(state.childTwoStateText, newState, e);
        return { childTwoStateText };
      });
    }
  }

  setRespondingState = (type: NodeType) => {
    this.setState({
      isParentResponding: type === NodeType.Parent,
      isChildOneResponding: type === NodeType.ChildOne,
      isChildTwoResponding: type === NodeType.ChildTwo,
    });
  };

  handleResponderGranted = (type: NodeType, e: GestureResponderEvent) => {
    this.increaseNumber(e);

    if (type === NodeType.Parent) {
      const newState = `parent request is granted`;

      this.setState((state) => {
        const parentStateText = this.getNewStateText(state.parentStateText, newState, e);
        return { parentStateText };
      });
    } else if (type === NodeType.ChildOne) {
      const newState = `child one request is granted`;

      this.setState((state) => {
        const childOneStateText = this.getNewStateText(state.childOneStateText, newState, e);
        return { childOneStateText };
      });
    } else if (type === NodeType.ChildTwo) {
      const newState = `child two request is granted`;

      this.setState((state) => {
        const childTwoStateText = this.getNewStateText(state.childTwoStateText, newState, e);
        return { childTwoStateText };
      });
    }

    this.setRespondingState(type);
  };

  handleResponderRejected = (type: NodeType, e: GestureResponderEvent) => {
    this.increaseNumber(e);

    if (type === NodeType.Parent) {
      const newState = `parent request is rejected`;

      this.setState((state) => {
        const parentStateText = this.getNewStateText(state.parentStateText, newState, e);
        return { parentStateText };
      });
    } else if (type === NodeType.ChildOne) {
      const newState = `child one request is rejected`;

      this.setState((state) => {
        const childOneStateText = this.getNewStateText(state.childOneStateText, newState, e);
        return { childOneStateText };
      });
    } else if (type === NodeType.ChildTwo) {
      const newState = `child two request is rejected`;

      this.setState((state) => {
        const childTwoStateText = this.getNewStateText(state.childTwoStateText, newState, e);
        return { childTwoStateText };
      });
    }
  };

  handleResponderStarted = (type: NodeType, e: GestureResponderEvent) => {
    this.increaseNumber(e);

    if (type === NodeType.Parent) {
      const newState = `parent is responding start event`;

      this.setState((state) => {
        const parentStateText = this.getNewStateText(state.parentStateText, newState, e);
        return { parentStateText };
      });
    } else if (type === NodeType.ChildOne) {
      const newState = `child one is responding start event`;

      this.setState((state) => {
        const childOneStateText = this.getNewStateText(state.childOneStateText, newState, e);
        return { childOneStateText };
      });
    } else if (type === NodeType.ChildTwo) {
      const newState = `child two is responding start event`;

      this.setState((state) => {
        const childTwoStateText = this.getNewStateText(state.childTwoStateText, newState, e);
        return { childTwoStateText };
      });
    }
  };

  handleResponderMoved = (type: NodeType, e: GestureResponderEvent) => {
    this.increaseNumber(e);

    if (type === NodeType.Parent) {
      const newState = `parent is responding move event`;

      this.setState((state) => {
        const parentStateText = this.getNewStateText(state.parentStateText, newState, e);
        return { parentStateText };
      });
    } else if (type === NodeType.ChildOne) {
      const newState = `child one is responding move event`;

      this.setState((state) => {
        const childOneStateText = this.getNewStateText(state.childOneStateText, newState, e);
        return { childOneStateText };
      });
    } else if (type === NodeType.ChildTwo) {
      const newState = `child two is responding move event`;

      this.setState((state) => {
        const childTwoStateText = this.getNewStateText(state.childTwoStateText, newState, e);
        return { childTwoStateText };
      });
    }
  };

  handleResponderEnded = (type: NodeType, e: GestureResponderEvent) => {
    this.increaseNumber(e);

    if (type === NodeType.Parent) {
      const newState = `parent end responding event`;

      this.setState((state) => {
        const parentStateText = this.getNewStateText(state.parentStateText, newState, e);
        return { parentStateText };
      });
    } else if (type === NodeType.ChildOne) {
      const newState = `child one end responding event`;

      this.setState((state) => {
        const childOneStateText = this.getNewStateText(state.childOneStateText, newState, e);
        return { childOneStateText };
      });
    } else if (type === NodeType.ChildTwo) {
      const newState = `child two end responding event`;

      this.setState((state) => {
        const childTwoStateText = this.getNewStateText(state.childTwoStateText, newState, e);
        return { childTwoStateText };
      });
    }
  };

  cancelRespondingState = (type: NodeType) => {
    const newState: any = {};

    if (type === NodeType.Parent) {
      newState.isParentResponding = false;
    }

    if (type === NodeType.ChildOne) {
      newState.isChildOneResponding = false;
    }

    if (type === NodeType.ChildTwo) {
      newState.isChildTwoResponding = false;
    }

    this.setState(newState);
  };

  handleResponderReleased = (type: NodeType, e: GestureResponderEvent) => {
    this.increaseNumber(e);

    if (type === NodeType.Parent) {
      const newState = `parent responder has been released`;

      this.setState((state) => {
        const parentStateText = this.getNewStateText(state.parentStateText, newState, e);
        return { parentStateText };
      });
    } else if (type === NodeType.ChildOne) {
      const newState = `child one responder has been released`;

      this.setState((state) => {
        const childOneStateText = this.getNewStateText(state.childOneStateText, newState, e);
        return { childOneStateText };
      });
    } else if (type === NodeType.ChildTwo) {
      const newState = `child two responder has been released`;

      this.setState((state) => {
        const childTwoStateText = this.getNewStateText(state.childTwoStateText, newState, e);
        return { childTwoStateText };
      });
    }

    this.cancelRespondingState(type);
  };
}

const style = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  parent: {
    borderColor: "gray",
    borderWidth: 2,
    width: "75%",
    flexDirection: "row",
    overflow: "scroll",
  },
  controls: {
    width: "25%",
    padding: 20,
  },
  parentStateTextContainer: {
    height: "100%",
    width: "33.33%",
    padding: 20,
  },
  child: {
    padding: 20,
    height: "100%",
    width: "33.33%",
    borderColor: "gray",
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "scroll",
  },
  stateText: {
    fontSize: 16,
    marginBottom: 10,
  },
  switch: {
    alignItems: "center",
    flexShrink: 0,
    flexDirection: "row",
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: "gray",
    padding: 20,
    textAlign: "center",
  },
});
