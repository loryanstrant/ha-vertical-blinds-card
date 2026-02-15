# Vertical Blinds Card for Home Assistant

A custom Lovelace card for Home Assistant that displays vertical blinds with a visual representation of their open/closed state.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

- 🎨 Visual representation of vertical blinds
- 🎯 Entity picker for easy configuration
- 🔢 Adjustable number of slats (3-20)
- 🌈 Customizable slat color
- 👆 Configurable tap, hold, and double-tap actions
- 📊 Shows position from 0% (closed) to 100% (open)
- ✏️ Visual editor with no YAML required
- 📱 Responsive design

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend"
3. Click the 3-dot menu in the top right and select "Custom repositories"
4. Add this repository URL
5. Click "Install"
6. Restart Home Assistant

### Manual Installation

1. Download the `vertical-blinds-card.js` file from the [latest release](https://github.com/loryanstrant/ha-vertical-blinds-card/releases)
2. Copy it to your `config/www` folder
3. Add the following to your `configuration.yaml`:

```yaml
lovelace:
  resources:
    - url: /local/vertical-blinds-card.js
      type: module
```

4. Restart Home Assistant

## Configuration

### Visual Editor

This card includes a full visual editor! Simply:

1. Go to your Lovelace dashboard
2. Click the 3-dot menu and select "Edit Dashboard"
3. Click "+ Add Card"
4. Search for "Vertical Blinds Card"
5. Configure using the visual editor

### YAML Configuration

You can also configure the card via YAML:

```yaml
type: custom:vertical-blinds-card
entity: cover.living_room_blinds
name: Living Room Blinds
slat_count: 8
slat_color: '#FFFFFF'
tap_action:
  action: toggle
hold_action:
  action: more-info
double_tap_action:
  action: none
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | **Required** | Must be `custom:vertical-blinds-card` |
| `entity` | string | **Required** | Entity ID of your cover |
| `name` | string | Entity's friendly name | Custom name for the card |
| `slat_count` | number | `8` | Number of vertical slats to display (3-20) |
| `slat_color` | string | `#FFFFFF` | Color of the blinds (hex color) |
| `tap_action` | object | `{action: 'toggle'}` | Action on tap |
| `hold_action` | object | `{action: 'more-info'}` | Action on hold |
| `double_tap_action` | object | `{action: 'none'}` | Action on double tap |

### Action Options

Each action (`tap_action`, `hold_action`, `double_tap_action`) supports:

| Action | Description |
|--------|-------------|
| `toggle` | Toggle the cover entity |
| `more-info` | Open the more-info dialog |
| `none` | Do nothing |

## Examples

### Basic Configuration

```yaml
type: custom:vertical-blinds-card
entity: cover.bedroom_blinds
```

### Full Configuration

```yaml
type: custom:vertical-blinds-card
entity: cover.living_room_blinds
name: My Custom Blinds
slat_count: 10
slat_color: '#E8E8E8'
tap_action:
  action: toggle
hold_action:
  action: more-info
double_tap_action:
  action: none
```

### White Blinds

```yaml
type: custom:vertical-blinds-card
entity: cover.office_blinds
slat_count: 12
slat_color: '#FFFFFF'
```

### Beige Blinds

```yaml
type: custom:vertical-blinds-card
entity: cover.bedroom_blinds
slat_count: 8
slat_color: '#F5DEB3'
```

## How It Works

The card reads the `current_position` attribute from your cover entity:
- **0** = Fully closed (slats slide left)
- **100** = Fully open (slats visible)
- **1-99** = Partially open

If your cover doesn't have a `current_position` attribute, the card will use the state:
- `closed` = 0%
- `open` = 100%
- Otherwise = 50%

## Development

### Prerequisites

- Node.js 18 or later
- npm

### Building

```bash
npm install
npm run build
```

The compiled file will be in the `dist` folder.

### Watch Mode

For development with automatic rebuilding:

```bash
npm run watch
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/loryanstrant/ha-vertical-blinds-card/issues) on GitHub.

## Credits

Inspired by real vertical blinds like [these](https://www.impressblinds.co.uk/wp-content/uploads/2023/08/vertical-blinds-0.jpg).

Built with:
- [Lit](https://lit.dev/) - Web Components library
- [custom-card-helpers](https://github.com/custom-cards/custom-card-helpers) - Home Assistant helpers
- [TypeScript](https://www.typescriptlang.org/) - Type safety
